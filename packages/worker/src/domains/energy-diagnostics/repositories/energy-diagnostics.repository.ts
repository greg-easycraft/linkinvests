import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvests/db';
import { EnergyDiagnosticInput } from '@linkinvests/shared';

@Injectable()
export class EnergyDiagnosticsRepository {
  private readonly logger = new Logger(EnergyDiagnosticsRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  /**
   * Insert energy sieve opportunities into the database in batches
   * @param opportunities - Array of energy sieve opportunities to insert
   * @param batchSize - Number of records to insert per batch (default: 500)
   * @returns Number of opportunities successfully inserted
   */
  async insertOpportunities(
    opportunities: EnergyDiagnosticInput[],
    batchSize: number = 500
  ): Promise<number> {
    if (opportunities.length === 0) {
      return 0;
    }

    let insertedCount = 0;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      try {
        // Debug: Log the first record being inserted to verify structure
        if (i === 0 && batch[0]) {
          this.logger.debug(
            `First DB record to insert: ${JSON.stringify(batch[0], null, 2)}`
          );
        }

        await this.db
          .insert(domainSchema.energyDiagnostics)
          .values(batch)
          .onConflictDoNothing({
            target: [domainSchema.energyDiagnostics.externalId],
          });

        insertedCount += batch.length;
        this.logger.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${opportunities.length} opportunities`
        );
      } catch (error) {
        this.logger.error(
          `Failed to insert batch starting at index ${i}: ${(error as Error).message}`
        );
        throw error; // Rethrow to let the processor handle the error
      }
    }

    return insertedCount;
  }
}
