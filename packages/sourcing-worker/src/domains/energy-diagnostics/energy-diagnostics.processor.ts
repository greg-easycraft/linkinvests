import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  EnergyDiagnosticInput,
  energyDiagnosticInputSchema,
  SOURCE_ENERGY_SIEVES_QUEUE,
} from '@linkinvests/shared';
import { AdemeApiService } from './services';
import { EnergyDiagnosticsRepository } from './repositories';
import type {
  EnergyDiagnosticJobData,
  DpeRecord,
} from './types/energy-diagnostics.types';

@Processor(SOURCE_ENERGY_SIEVES_QUEUE, { concurrency: 1 })
export class EnergyDiagnosticsProcessor extends WorkerHost {
  private readonly logger = new Logger(EnergyDiagnosticsProcessor.name);

  constructor(
    private readonly ademeApi: AdemeApiService,
    private readonly opportunityRepository: EnergyDiagnosticsRepository,
  ) {
    super();
  }

  async process(job: Job<EnergyDiagnosticJobData>): Promise<void> {
    const {
      departmentId,
      sinceDate,
      beforeDate,
      energyClasses = ['F', 'G'],
    } = job.data;
    const startTime = Date.now();

    const dateRangeText = beforeDate
      ? `from ${sinceDate} to ${beforeDate}`
      : `since ${sinceDate}`;
    this.logger.log(
      `Starting to process energy sieves for department ${departmentId} ${dateRangeText} with classes ${energyClasses.join(', ')}`,
    );

    const stats = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      opportunitiesInserted: 0,
      errors: 0,
    };

    try {
      // Step 1: Fetch all DPE records from ADEME API
      this.logger.log('Step 1/3: Fetching DPE records from ADEME API...');
      const energyClassRecords = await this.ademeApi.fetchAllDpeRecords(
        departmentId,
        sinceDate,
        energyClasses,
        beforeDate,
      );
      stats.totalRecords = energyClassRecords.length;
      this.logger.log(`Fetched ${energyClassRecords.length} DPE records`);

      // Step 2: Transform records to opportunities
      this.logger.log('Step 2/3: Transforming DPE records to opportunities...');
      const opportunities: EnergyDiagnosticInput[] = [];

      for (const record of energyClassRecords) {
        try {
          const opportunity = this.transformDpeRecord(record);
          if (opportunity) {
            opportunities.push(opportunity);
            stats.validRecords++;
          } else {
            stats.invalidRecords++;
          }
        } catch (error) {
          stats.errors++;
          stats.invalidRecords++;
          this.logger.warn(
            `Failed to transform record ${record.numero_dpe}: ${(error as Error).message}`,
          );
        }
      }

      this.logger.log(
        `Transformed ${opportunities.length} valid opportunities (${stats.invalidRecords} invalid)`,
      );

      // Step 3: Insert opportunities into database in batches
      this.logger.log('Step 3/3: Inserting opportunities into database...');

      if (opportunities.length > 0) {
        try {
          const insertedCount =
            await this.opportunityRepository.insertOpportunities(opportunities);
          stats.opportunitiesInserted = insertedCount;
        } catch (error) {
          stats.errors++;
          this.logger.error(
            `Failed to insert opportunities: ${(error as Error).message}`,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Successfully processed energy sieves for department ${departmentId}`,
      );
      this.logger.log(`Processing stats:
        - Duration: ${duration}ms
        - Total records fetched: ${stats.totalRecords}
        - Valid records: ${stats.validRecords}
        - Invalid records: ${stats.invalidRecords}
        - Opportunities inserted: ${stats.opportunitiesInserted}
        - Errors: ${stats.errors}
      `);
    } catch (error) {
      this.logger.error(
        `Failed to process energy sieves for department ${departmentId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Transform a DPE record into an opportunity
   * @param record - DPE record from ADEME API
   * @param departmentId - Department ID
   * @returns Transformed opportunity or null if invalid
   */
  private transformDpeRecord(record: DpeRecord): EnergyDiagnosticInput | null {
    // Validate required fields
    if (!record._geopoint) {
      return null;
    }
    const [latStr, lonStr] = record._geopoint.split(',');

    const opportunityDateStr =
      record.date_etablissement_dpe || record.date_reception_dpe;
    if (!opportunityDateStr) {
      this.logger.warn(
        `Missing opportunity date for record ${record.numero_dpe}`,
      );
      return null;
    }
    const opportunityDate = new Date(opportunityDateStr)
      .toISOString()
      .split('T')[0];

    const energyClassInput = {
      externalId: record.numero_dpe,
      label: record.adresse_ban || record.nom_commune_ban || 'Unknown',
      address: record.adresse_ban,
      zipCode: record.code_postal_ban,
      department: record.code_departement_ban,
      latitude: parseFloat(latStr || ''),
      longitude: parseFloat(lonStr || ''),
      opportunityDate,
      energyClass: record.etiquette_dpe,
      squareFootage: record.surface_habitable_logement,
    };

    const validationResult =
      energyDiagnosticInputSchema.safeParse(energyClassInput);
    if (!validationResult.success) {
      this.logger.warn(
        `Invalid DPE record ${record.numero_dpe}: ${JSON.stringify(validationResult.error.issues)}`,
      );
      return null;
    }

    return validationResult.data;
  }
}
