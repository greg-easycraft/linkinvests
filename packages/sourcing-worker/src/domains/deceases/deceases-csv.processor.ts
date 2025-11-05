import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { S3Service } from '~/storage/s3.service';
import { CsvParsingService } from './services/csv-parsing.service';
import { InseeApiService } from './services/insee-api.service';
import { DeceasesOpportunityRepository } from './repositories/deceases-opportunity.repository';
import {
  DeceasesCsvProcessJobData,
  InseeCsvRow,
  CsvProcessingStats,
  DeceasesOpportunity,
  MairieInfo,
} from './types/deceases.types';
import { SOURCE_DECEASES_CSV_PROCESS_QUEUE } from '@linkinvests/shared';

@Injectable()
@Processor(SOURCE_DECEASES_CSV_PROCESS_QUEUE)
export class DeceasesCsvProcessor extends WorkerHost {
  private readonly logger = new Logger(DeceasesCsvProcessor.name);
  private lastProcessedMairieId: string = '';
  private lastProcessedMairieInfo: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    mairieInfo: MairieInfo;
  } | null = null;

  constructor(
    private readonly s3Service: S3Service,
    private readonly csvParsingService: CsvParsingService,
    private readonly inseeApiService: InseeApiService,
    private readonly repository: DeceasesOpportunityRepository,
  ) {
    super();
  }

  async process(job: Job<DeceasesCsvProcessJobData>): Promise<void> {
    const { s3Path, fileName } = job.data;

    this.logger.log('Starting CSV processing job', {
      jobId: job.id,
      s3Path,
      fileName,
    });

    const stats: CsvProcessingStats = {
      totalRecords: 0,
      recordsProcessed: 0,
      recordsFiltered: 0,
      geocodingAttempts: 0,
      geocodingSuccesses: 0,
      mairieInfoAttempts: 0,
      mairieInfoSuccesses: 0,
      opportunitiesInserted: 0,
      errors: 0,
      failedRows: [],
    };

    try {
      // Download CSV from S3
      this.logger.log('Downloading CSV from S3', { s3Path });
      const csvBuffer = await this.s3Service.downloadFile(s3Path);

      // Parse CSV with age filtering using streaming
      this.logger.log('Parsing CSV with age filtering using streaming');
      const { rows: csvRows, stats: parseStats } =
        await this.csvParsingService.parseCsv(csvBuffer, 50);

      stats.totalRecords = parseStats.totalRecords;
      stats.recordsFiltered = parseStats.recordsFiltered;

      this.logger.log('CSV parsing completed', {
        totalRecords: stats.totalRecords,
        validRows: csvRows.length,
        recordsFiltered: stats.recordsFiltered,
      });

      if (csvRows.length === 0) {
        this.logger.warn('No valid records to process');
        await this.finalizeCsv(s3Path, fileName, stats);
        return;
      }

      // Process records in batches
      const batchSize = 1000;
      let opportunitiesInserted = 0;

      for (let i = 0; i < csvRows.length; i += batchSize) {
        const batch = csvRows.slice(i, i + batchSize);
        this.logger.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(csvRows.length / batchSize)}`,
          {
            batchSize: batch.length,
            processed: i,
            total: csvRows.length,
          },
        );

        const batchOpportunities = await this.processBatch(batch, stats);
        // Insert opportunities into database
        if (batchOpportunities.length > 0) {
          this.logger.log('Inserting opportunities into database', {
            count: batchOpportunities.length,
          });
          opportunitiesInserted +=
            await this.repository.insertOpportunities(batchOpportunities);
        }

        // Update progress
        stats.recordsProcessed = i + batch.length;

        this.logger.log('Batch processing completed', {
          batchOpportunities: batchOpportunities.length,
          totalOpportunities: opportunitiesInserted,
          stats: {
            geocodingAttempts: stats.geocodingAttempts,
            geocodingSuccesses: stats.geocodingSuccesses,
            mairieInfoAttempts: stats.mairieInfoAttempts,
            mairieInfoSuccesses: stats.mairieInfoSuccesses,
            errors: stats.errors,
          },
        });
      }

      // Finalize processing
      await this.finalizeCsv(s3Path, fileName, stats);

      this.logger.log('CSV processing completed successfully', {
        fileName,
        finalStats: stats,
      });
    } catch (error) {
      this.logger.error('CSV processing job failed', {
        jobId: job.id,
        s3Path,
        fileName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        stats,
      });
      throw error;
    }
  }

  /**
   * Process a batch of CSV rows
   */
  private async processBatch(
    batch: InseeCsvRow[],
    stats: CsvProcessingStats,
  ): Promise<DeceasesOpportunity[]> {
    const opportunities: DeceasesOpportunity[] = [];

    for (const row of batch) {
      try {
        const opportunity = await this.processRow(row, stats);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      } catch (error) {
        stats.errors++;
        stats.failedRows.push({
          row,
          error: error instanceof Error ? error.message : String(error),
        });

        this.logger.warn('Failed to process row', {
          nomprenom: row.nomprenom,
          lieudeces: row.lieudeces,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return opportunities;
  }

  /**
   * Process a single CSV row
   */
  private async processRow(
    row: InseeCsvRow,
    stats: CsvProcessingStats,
  ): Promise<DeceasesOpportunity | null> {
    // Validate required fields
    if (!row.nomprenom || !row.datedeces || !row.lieudeces) {
      throw new Error(
        'Missing required fields: nomprenom, datedeces, or lieudeces',
      );
    }

    // Fetch commune coordinates
    stats.geocodingAttempts++;
    stats.mairieInfoAttempts++;
    const mairieInfoResult = await this.getMairieInfo(row.lieudeces);
    if (!mairieInfoResult) {
      throw new Error(
        `Failed to fetch mairie info for commune: ${row.lieudeces}`,
      );
    }
    const { coordinates, mairieInfo } = mairieInfoResult;
    stats.geocodingSuccesses++;
    stats.mairieInfoSuccesses++;

    // Generate unique ID for the death record
    const inseeDeathId = this.generateDeathId(row);

    // Extract department from INSEE code
    const department = this.extractDepartment(row.lieudeces);
    if (!department) {
      throw new Error(`Invalid INSEE code: ${row.lieudeces}`);
    }

    // Extract zip code (use first 5 digits of INSEE code, or extract from commune name)
    const zipCode = this.extractZipCode(row.lieudeces);

    // Format opportunity date
    const opportunityDate = this.formatDate(row.datedeces);

    // Clean person name
    const personName = this.cleanPersonName(row.nomprenom);

    // Use commune name or mairie name as address
    const address =
      row.commnaiss || mairieInfo?.name || `Commune ${row.lieudeces}`;

    const opportunity: DeceasesOpportunity = {
      inseeDeathId,
      label: personName,
      siret: null,
      address,
      zipCode,
      department,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      opportunityDate,
      mairieInfo: mairieInfo || undefined,
    };

    return opportunity;
  }

  private async getMairieInfo(inseeCode: string): Promise<{
    coordinates: {
      latitude: number;
      longitude: number;
    };
    mairieInfo: MairieInfo;
  } | null> {
    if (this.lastProcessedMairieId === inseeCode) {
      return this.lastProcessedMairieInfo;
    }

    const coordinates =
      await this.inseeApiService.fetchCommuneCoordinates(inseeCode);
    const mairieInfo = await this.inseeApiService.fetchMairieInfo(inseeCode);
    if (!coordinates || !mairieInfo) {
      return null;
    }
    this.lastProcessedMairieId = inseeCode;
    this.lastProcessedMairieInfo = { coordinates, mairieInfo };
    return { coordinates, mairieInfo };
  }

  /**
   * Generate unique death ID
   */
  private generateDeathId(row: InseeCsvRow): string {
    // Combine lieu de décès, date de décès, and acte de décès for unique ID
    return `${row.lieudeces}_${row.datedeces}_${row.actedeces}`;
  }

  /**
   * Extract department from INSEE code
   */
  private extractDepartment(inseeCode: string): string | null {
    if (!inseeCode || inseeCode.length < 2) {
      return null;
    }

    // For most departments, first 2 digits
    let dept = inseeCode.substring(0, 2);

    // Handle special cases for overseas territories
    if (inseeCode.startsWith('971'))
      dept = '971'; // Guadeloupe
    else if (inseeCode.startsWith('972'))
      dept = '972'; // Martinique
    else if (inseeCode.startsWith('973'))
      dept = '973'; // Guyane
    else if (inseeCode.startsWith('974'))
      dept = '974'; // La Réunion
    else if (inseeCode.startsWith('976'))
      dept = '976'; // Mayotte
    else if (inseeCode.startsWith('2A'))
      dept = '2A'; // Corse-du-Sud
    else if (inseeCode.startsWith('2B')) dept = '2B'; // Haute-Corse

    return dept;
  }

  /**
   * Extract zip code from INSEE code or commune name
   */
  private extractZipCode(inseeCode: string): string {
    // For simplicity, use the INSEE code as base
    // This could be enhanced with a proper INSEE -> postal code mapping
    if (inseeCode.length >= 5) {
      return inseeCode.substring(0, 5);
    }

    // For overseas territories, use full INSEE code
    if (
      inseeCode.startsWith('97') ||
      inseeCode.startsWith('2A') ||
      inseeCode.startsWith('2B')
    ) {
      return inseeCode;
    }

    // Fallback: pad with zeros
    return inseeCode.padEnd(5, '0');
  }

  /**
   * Format date from YYYYMMDD to YYYY-MM-DD
   */
  private formatDate(dateStr: string): string {
    if (dateStr.length !== 8) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
  }

  /**
   * Clean person name from INSEE format
   */
  private cleanPersonName(nomprenom: string): string {
    // INSEE format: "LASTNAME*FIRSTNAME/"
    let cleaned = nomprenom.replace(/\*/g, ' ').replace(/\/$/, '');

    // Capitalize first letter of each word
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

    return cleaned.trim();
  }

  /**
   * Finalize CSV processing
   */
  private async finalizeCsv(
    originalS3Path: string,
    fileName: string,
    stats: CsvProcessingStats,
  ): Promise<void> {
    try {
      // Archive processed file
      const archivePath = originalS3Path.replace('/raw/', '/processed/');
      this.logger.log('Archiving processed file', {
        from: originalS3Path,
        to: archivePath,
      });

      // Since S3 doesn't have a direct move operation, we'll copy and delete
      const fileBuffer = await this.s3Service.downloadFile(originalS3Path);
      const archiveKey = archivePath.replace(/^s3:\/\/[^/]+\//, '');
      await this.s3Service.uploadFile(fileBuffer, archiveKey);
      await this.s3Service.deleteFile(originalS3Path);

      // Upload failed records if any
      if (stats.failedRows.length > 0) {
        const failedCsv = this.csvParsingService.generateFailedRecordsCsv(
          stats.failedRows,
        );
        const failedFileName = fileName.replace('.csv', '_failed.csv');
        const failedKey = `deceases/failed/${failedFileName}`;

        this.logger.log('Uploading failed records', {
          failedCount: stats.failedRows.length,
          failedKey,
        });

        await this.s3Service.uploadFile(
          Buffer.from(failedCsv, 'utf-8'),
          failedKey,
        );
      }

      this.logger.log('CSV processing finalized', {
        fileName,
        archivedTo: archivePath,
        failedRowsUploaded: stats.failedRows.length,
      });
    } catch (error) {
      this.logger.error('Failed to finalize CSV processing', {
        fileName,
        originalS3Path,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw here - the main processing succeeded
    }
  }
}
