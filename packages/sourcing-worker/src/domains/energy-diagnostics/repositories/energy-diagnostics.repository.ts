import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvests/db';
import type { EnergyDiagnostic } from '../types/energy-diagnostics.types';

@Injectable()
export class EnergyDiagnosticsOpportunityRepository {
  private readonly logger = new Logger(EnergyDiagnosticsOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
  ) {}

  /**
   * Insert energy sieve opportunities into the database in batches
   * @param opportunities - Array of energy sieve opportunities to insert
   * @param batchSize - Number of records to insert per batch (default: 500)
   * @returns Number of opportunities successfully inserted
   */
  async insertOpportunities(
    opportunities: EnergyDiagnostic[],
    batchSize: number = 500,
  ): Promise<number> {
    if (opportunities.length === 0) {
      return 0;
    }

    let insertedCount = 0;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      const dbOpportunities = batch.map((opp, index) => {
        const formattedDate = this.formatDateForDb(opp.opportunityDate);

        // Debug log the first few records
        if (i === 0 && index < 3) {
          this.logger.debug(
            `Record ${index}: opportunityDate=${opp.opportunityDate.toISOString()}, formatted=${formattedDate}`,
          );
        }

        return {
          // Base opportunity fields
          label: opp.label,
          // Note: siret removed as it's always null for energy sieves
          address: opp.address,
          zipCode: opp.zipCode,
          department: opp.department.toString().padStart(2, '0'),
          latitude: opp.latitude,
          longitude: opp.longitude,
          // Convert Date to string format 'YYYY-MM-DD' for Drizzle
          opportunityDate: formattedDate,
          externalId: opp.numeroDpe,

          // Energy-specific fields (normalized from extraData)
          energyClass: opp.extraData?.energyClass || null,
          dpeNumber: opp.numeroDpe, // Store DPE number in dedicated field
        };
      });

      try {
        // Debug: Log the first record being inserted to verify structure
        if (i === 0 && dbOpportunities[0]) {
          this.logger.debug(
            `First DB record to insert: ${JSON.stringify(dbOpportunities[0], null, 2)}`,
          );
        }

        await this.db
          .insert(domainSchema.energyDiagnostics)
          .values(dbOpportunities)
          .onConflictDoNothing({
            target: [domainSchema.energyDiagnostics.dpeNumber],
          });

        insertedCount += batch.length;
        this.logger.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${opportunities.length} opportunities`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to insert batch starting at index ${i}: ${(error as Error).message}`,
        );
        throw error; // Rethrow to let the processor handle the error
      }
    }

    return insertedCount;
  }

  /**
   * Format a Date object to 'YYYY-MM-DD' string for database insertion
   * @param date - Date object to format
   * @returns Date string in 'YYYY-MM-DD' format
   */
  private formatDateForDb(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
