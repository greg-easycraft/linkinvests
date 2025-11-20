import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvests/db';
import { ListingInput } from '@linkinvests/shared';
import { eq, lt, and, type SQL } from 'drizzle-orm';

@Injectable()
export class ListingsRepository {
  private readonly logger = new Logger(ListingsRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
  ) {}

  /**
   * Insert listing opportunities into the database in batches
   * @param listings - Array of listing opportunities to insert
   * @param batchSize - Number of records to insert per batch (default: 500)
   * @returns Number of listings successfully inserted
   */
  async insertListings(
    listings: ListingInput[],
    batchSize: number = 500,
  ): Promise<number> {
    if (listings.length === 0) {
      this.logger.log('No listings to insert');
      return 0;
    }

    let insertedCount = 0;
    let skippedCount = 0;

    this.logger.log(
      `Starting batch insert of ${listings.length} listings with batch size ${batchSize}`,
    );

    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);

      try {
        // Debug: Log the first record being inserted to verify structure
        if (i === 0 && batch[0]) {
          this.logger.debug(
            `First DB record to insert: ${JSON.stringify(batch[0], null, 2)}`,
          );
        }

        const result = await this.db
          .insert(domainSchema.opportunityListings)
          .values(batch)
          // @todo: use onConflictDoUpdate to update the listing if it already exists
          .onConflictDoNothing({
            target: [domainSchema.opportunityListings.externalId],
          });

        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(listings.length / batchSize);

        // Count how many were actually inserted (not duplicates)
        const actualInsertCount = result.rowCount || batch.length;
        const batchSkipped = batch.length - actualInsertCount;

        insertedCount += actualInsertCount;
        skippedCount += batchSkipped;

        this.logger.log(
          `Processed batch ${batchNumber}/${totalBatches}: ${actualInsertCount} inserted, ${batchSkipped} skipped (duplicates). Total: ${insertedCount} inserted, ${skippedCount} skipped.`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to insert batch starting at index ${i} (batch ${Math.floor(i / batchSize) + 1}): ${(error as Error).message}`,
        );
        throw error; // Rethrow to let the processor handle the error
      }
    }

    this.logger.log(
      `Batch insert completed: ${insertedCount} listings inserted, ${skippedCount} duplicates skipped out of ${listings.length} total`,
    );

    return insertedCount;
  }

  /**
   * Get count of listings by source
   * @param source - Listing source to filter by
   * @returns Count of listings for the specified source
   */
  async getListingsCountBySource(source: string): Promise<number> {
    try {
      const result = await this.db
        .select({ count: domainSchema.opportunityListings.id })
        .from(domainSchema.opportunityListings)
        .where(eq(domainSchema.opportunityListings.source, source));

      return result.length;
    } catch (error) {
      this.logger.error(
        `Failed to get listings count for source ${source}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Get recent listings by source
   * @param source - Listing source to filter by
   * @param limit - Maximum number of listings to return (default: 10)
   * @returns Array of recent listings for the specified source
   */
  async getRecentListingsBySource(
    source: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const result = await this.db
        .select()
        .from(domainSchema.opportunityListings)
        .where(eq(domainSchema.opportunityListings.source, source))
        .orderBy(domainSchema.opportunityListings.createdAt)
        .limit(limit);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get recent listings for source ${source}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Delete listings older than specified date
   * @param beforeDate - Delete listings created before this date
   * @param source - Optional source filter
   * @returns Number of listings deleted
   */
  async deleteOldListings(
    beforeDate: string,
    source?: string,
  ): Promise<number> {
    try {
      let whereCondition: SQL<unknown> = lt(
        domainSchema.opportunityListings.createdAt,
        new Date(beforeDate),
      );

      if (source) {
        whereCondition = and(
          whereCondition,
          eq(domainSchema.opportunityListings.source, source),
        )!;
      }

      const result = await this.db
        .delete(domainSchema.opportunityListings)
        .where(whereCondition);

      const deletedCount = result.rowCount || 0;

      this.logger.log(
        `Deleted ${deletedCount} listings ${source ? `from source ${source} ` : ''}created before ${beforeDate}`,
      );

      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Failed to delete old listings: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
