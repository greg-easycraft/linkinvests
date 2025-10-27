import { Logger, Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE, OpportunityType } from '@linkinvest/shared';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvest/db';
import { AdemeApiService } from './services';
import type {
  EnergySieveJobData,
  DpeRecord,
  EnergySieveOpportunity,
} from './types/energy-sieves.types';

@Processor(SOURCE_ENERGY_SIEVES_QUEUE)
export class EnergySievesProcessor extends WorkerHost {
  private readonly logger = new Logger(EnergySievesProcessor.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
    private readonly ademeApi: AdemeApiService,
  ) {
    super();
  }

  async process(job: Job<EnergySieveJobData>): Promise<void> {
    const { departmentId, sinceDate, energyClasses = ['F', 'G'] } = job.data;
    const startTime = Date.now();

    this.logger.log(
      `Starting to process energy sieves for department ${departmentId} since ${sinceDate} with classes ${energyClasses.join(', ')}`,
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
      const dpeRecords = await this.ademeApi.fetchAllDpeRecords(
        departmentId,
        sinceDate,
        energyClasses,
      );
      stats.totalRecords = dpeRecords.length;
      this.logger.log(`Fetched ${dpeRecords.length} DPE records`);

      // Step 2: Transform records to opportunities
      this.logger.log('Step 2/3: Transforming DPE records to opportunities...');
      const opportunities: EnergySieveOpportunity[] = [];

      for (const record of dpeRecords) {
        try {
          const opportunity = this.transformDpeRecord(record, departmentId);
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
        const batchSize = 500;
        let insertedCount = 0;

        for (let i = 0; i < opportunities.length; i += batchSize) {
          const batch = opportunities.slice(i, i + batchSize);

          const dbOpportunities = batch.map((opp) => ({
            label: opp.label,
            siret: null, // No SIRET for energy sieves
            address: opp.address,
            zipCode: opp.zipCode,
            department: opp.department,
            latitude: opp.latitude,
            longitude: opp.longitude,
            type: OpportunityType.PASSOIRE_THERMIQUE,
            status: 'pending_review',
            opportunityDate: opp.opportunityDate || null,
          }));

          try {
            await this.db
              .insert(domainSchema.opportunities)
              .values(dbOpportunities)
              .onConflictDoNothing(); // Skip duplicates

            insertedCount += batch.length;
            this.logger.log(
              `Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${opportunities.length} opportunities`,
            );
          } catch (error) {
            stats.errors++;
            this.logger.error(
              `Failed to insert batch starting at index ${i}: ${(error as Error).message}`,
            );
          }
        }

        stats.opportunitiesInserted = insertedCount;
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
  private transformDpeRecord(
    record: DpeRecord,
    departmentId: number,
  ): EnergySieveOpportunity | null {
    // Validate required fields
    if (!record.adresse_ban || !record.code_postal_ban || !record._geopoint) {
      return null;
    }

    // Parse coordinates from _geopoint (format: "lat,lon")
    const [latStr, lonStr] = record._geopoint.split(',');
    const latitude = parseFloat(latStr || '');
    const longitude = parseFloat(lonStr || '');

    if (isNaN(latitude) || isNaN(longitude)) {
      this.logger.warn(
        `Invalid coordinates for record ${record.numero_dpe}: ${record._geopoint}`,
      );
      return null;
    }

    // Parse postal code
    const zipCode = parseInt(record.code_postal_ban, 10);
    if (isNaN(zipCode)) {
      this.logger.warn(
        `Invalid postal code for record ${record.numero_dpe}: ${record.code_postal_ban}`,
      );
      return null;
    }

    // Create label (use address or municipality name)
    const label = record.adresse_ban || record.nom_commune_ban || 'Unknown';

    // Use DPE establishment date as opportunity date (fallback to reception date if not available)
    const opportunityDate =
      record.date_etablissement_dpe || record.date_reception_dpe || '';

    return {
      label,
      address: record.adresse_ban,
      zipCode,
      department: departmentId,
      latitude,
      longitude,
      opportunityDate,
    };
  }
}
