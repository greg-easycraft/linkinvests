import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SOURCE_DECEASES_QUEUE } from '@linkinvests/shared';

import { DeceasesOpportunityRepository } from './repositories';
import { InseeApiService } from './services';
import type {
  DeceasesJobData,
  InseeDeathRecord,
  DeceasesOpportunity,
} from './types/deceases.types';

@Processor(SOURCE_DECEASES_QUEUE)
export class DeceasesProcessor extends WorkerHost {
  private readonly logger = new Logger(DeceasesProcessor.name);

  constructor(
    private readonly inseeApiService: InseeApiService,
    private readonly deceasesOpportunityRepository: DeceasesOpportunityRepository,
  ) {
    super();
  }

  async process(job: Job<DeceasesJobData>): Promise<void> {
    const { sinceDate, untilDate } = job.data;

    this.logger.log({
      jobId: job.id,
      sinceDate,
      untilDate,
      message: 'Starting deceases import job',
    });

    try {
      // In a real implementation, you would:
      // 1. Read CSV files from a source (S3, local filesystem, API)
      // 2. Parse the CSV and get death records
      // For now, this is a placeholder that processes mock data

      // Example: const deathRecords = await this.readDeathRecordsFromSource(sinceDate, untilDate);
      const deathRecords: InseeDeathRecord[] = [];

      if (deathRecords.length === 0) {
        this.logger.log('No death records found to process');
        return;
      }

      const opportunities = await this.processDeathRecords(deathRecords);

      if (opportunities.length === 0) {
        this.logger.log('No valid opportunities after processing');
        return;
      }

      const insertedCount =
        await this.deceasesOpportunityRepository.insertOpportunities(
          opportunities,
        );

      this.logger.log({
        jobId: job.id,
        totalRecords: deathRecords.length,
        validOpportunities: opportunities.length,
        inserted: insertedCount,
        message: 'Job completed successfully',
      });
    } catch (error) {
      this.logger.error({
        jobId: job.id,
        error: (error as Error).message,
        message: 'Job failed',
      });
      throw error;
    }
  }

  private async processDeathRecords(
    records: InseeDeathRecord[],
  ): Promise<DeceasesOpportunity[]> {
    const opportunities: DeceasesOpportunity[] = [];
    let processedCount = 0;
    let skippedAgeCount = 0;
    let skippedApiCount = 0;

    for (const record of records) {
      processedCount++;

      if (processedCount % 100 === 0) {
        this.logger.log(
          `Processed ${processedCount}/${records.length} records`,
        );
      }

      // Apply 50+ age business rule
      const age = this.calculateAge(record.dateNaissance, record.dateDeces);
      if (age < 50) {
        skippedAgeCount++;
        continue;
      }

      // Fetch GPS coordinates
      const coordinates = await this.inseeApiService.fetchCommuneCoordinates(
        record.lieuDeces,
      );
      if (!coordinates) {
        skippedApiCount++;
        this.logger.warn({
          lieuDeces: record.lieuDeces,
          nomPrenom: record.nomPrenom,
          message: 'Skipping record: no coordinates found',
        });
        continue;
      }

      // Fetch mairie info (optional, used for address enrichment)
      const mairieInfo = await this.inseeApiService.fetchMairieInfo(
        record.lieuDeces,
      );

      // Transform to opportunity
      const opportunity: DeceasesOpportunity = {
        label: this.formatName(record.nomPrenom),
        siret: null,
        address: mairieInfo?.name || record.lieuDeces,
        zipCode: this.extractZipCode(record.lieuDeces),
        department: this.extractDepartment(record.lieuDeces),
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        opportunityDate: this.formatDate(record.dateDeces),
      };

      opportunities.push(opportunity);
    }

    this.logger.log({
      total: records.length,
      processed: processedCount,
      skippedAge: skippedAgeCount,
      skippedApi: skippedApiCount,
      valid: opportunities.length,
      message: 'Processing statistics',
    });

    return opportunities;
  }

  private calculateAge(dateNaissance: string, dateDeces: string): number {
    const birthYear = parseInt(dateNaissance.substring(0, 4), 10);
    const deathYear = parseInt(dateDeces.substring(0, 4), 10);
    return Math.abs(deathYear - birthYear);
  }

  private formatDate(inseeDate: string): string {
    // Convert YYYYMMDD to YYYY-MM-DD
    if (inseeDate.length !== 8) {
      return inseeDate;
    }
    const year = inseeDate.substring(0, 4);
    const month = inseeDate.substring(4, 6);
    const day = inseeDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  private formatName(nomPrenom: string): string {
    // Clean up and format the name
    return nomPrenom.trim().replace(/\s+/g, ' ');
  }

  private extractDepartment(lieuCode: string): string {
    // Extract department from INSEE code (first 2-3 digits)
    if (lieuCode.length >= 2) {
      return lieuCode.substring(0, 2);
    }
    return '00';
  }

  private extractZipCode(lieuCode: string): string {
    // For now, use the INSEE code as a placeholder
    // In a real implementation, you would look up the actual zip code
    return lieuCode.padEnd(5, '0').substring(0, 5);
  }
}
