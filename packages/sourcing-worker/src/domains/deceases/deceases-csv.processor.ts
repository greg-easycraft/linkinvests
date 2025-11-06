import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { S3Service } from '~/storage/s3.service';
import { CsvParsingService } from './services/csv-parsing.service';
import { InseeApiService, MairieData } from './services/insee-api.service';
import { DeceasesOpportunityRepository } from './repositories/deceases-opportunity.repository';
import {
  DeceasesCsvProcessJobData,
  InseeCsvRow,
  CsvProcessingStats,
  DeceasesOpportunity,
} from './types/deceases.types';
import { SOURCE_DECEASES_CSV_PROCESS_QUEUE } from '@linkinvests/shared';

@Injectable()
@Processor(SOURCE_DECEASES_CSV_PROCESS_QUEUE, { concurrency: 1 })
export class DeceasesCsvProcessor extends WorkerHost {
  private readonly logger = new Logger(DeceasesCsvProcessor.name);
  private lastProcessedMairieId: string = '';
  private lastProcessedMairieData: MairieData | null = null;

  constructor(
    private readonly s3Service: S3Service,
    private readonly csvParsingService: CsvParsingService,
    private readonly inseeApiService: InseeApiService,
    private readonly repository: DeceasesOpportunityRepository,
  ) {
    super();
  }

  async process(job: Job<DeceasesCsvProcessJobData>): Promise<void> {
    const { fileName } = job.data;
    const s3Path = `deceases/${fileName}`;

    this.logger.log('Starting CSV processing job', {
      jobId: job.id,
      s3Path,
      fileName,
    });

    const stats: CsvProcessingStats = {
      totalRecords: 0,
      recordsProcessed: 0,
      recordsFiltered: 0,
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
        await this.finalizeCsv(fileName, stats);
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
            mairieInfoAttempts: stats.mairieInfoAttempts,
            mairieInfoSuccesses: stats.mairieInfoSuccesses,
            errors: stats.errors,
          },
        });
      }

      // Finalize processing
      await this.finalizeCsv(fileName, stats);

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

    // If death occured outside France
    if (row.lieudeces.startsWith('99') || row.lieudeces.startsWith('97')) {
      return null;
    }

    // Fetch commune coordinates
    stats.mairieInfoAttempts++;
    const mairieDataResult = await this.getMairieInfo(row.lieudeces);
    if (!mairieDataResult) {
      throw new Error(
        `Failed to fetch mairie info for commune: ${row.lieudeces}`,
      );
    }
    const { coordinates, contactInfo, zipCode, address } = mairieDataResult;
    stats.mairieInfoSuccesses++;
    const { firstName, lastName } = this.cleanPersonName(row.nomprenom);

    const opportunity: DeceasesOpportunity = {
      inseeDeathId: this.generateDeathId(row),
      label: `Succession ${firstName.split(' ')[0]} ${lastName.toUpperCase()}`,
      siret: null,
      address,
      zipCode,
      department: row.lieudeces.substring(0, 2),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      opportunityDate: this.formatDate(row.datedeces),
      mairieInfo: contactInfo,
      extraData: {
        firstName,
        lastName,
      },
    };

    return opportunity;
  }

  private async getMairieInfo(inseeCode: string): Promise<MairieData | null> {
    if (this.lastProcessedMairieId === inseeCode) {
      return this.lastProcessedMairieData;
    }

    const mairieData = await this.inseeApiService.fetchMairieData(inseeCode);
    if (!mairieData) {
      return null;
    }
    this.lastProcessedMairieId = inseeCode;
    this.lastProcessedMairieData = mairieData;
    return mairieData;
  }

  /**
   * Generate unique death ID
   */
  private generateDeathId(row: InseeCsvRow): string {
    // Combine lieu de décès, date de décès, and acte de décès for unique ID
    return `${row.lieudeces}_${row.datedeces}_${row.actedeces}`;
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
  private cleanPersonName(nomprenom: string): {
    firstName: string;
    lastName: string;
  } {
    // INSEE format: "LASTNAME*FIRSTNAME/"
    // INSEE format: "LASTNAME*FIRSTNAME/"
    const cleaned = nomprenom.replace(/\/$/, '');
    const [lastNameRaw, firstNameRaw] = cleaned.split('*');

    // Capitalize first and last names properly
    const formatName = (str: string) =>
      str
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

    return {
      lastName: formatName(lastNameRaw ?? ''),
      firstName: formatName(firstNameRaw ?? ''),
    };
  }

  /**
   * Finalize CSV processing
   */
  private async finalizeCsv(
    fileName: string,
    stats: CsvProcessingStats,
  ): Promise<void> {
    try {
      // Archive processed file
      const originalS3Path = `deceases/${fileName}`;
      const archivePath = `deceases/processed/${fileName}`;
      this.logger.log('Archiving processed file', {
        from: originalS3Path,
        to: archivePath,
      });

      // Since S3 doesn't have a direct move operation, we'll copy and delete
      await this.s3Service.moveFile(originalS3Path, archivePath);

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
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw here - the main processing succeeded
    }
  }
}
