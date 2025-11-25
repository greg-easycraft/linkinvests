import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { sql } from 'drizzle-orm';
import { AuctionInput } from '@linkinvests/shared';

@Injectable()
export class AuctionsOpportunityRepository {
  private readonly logger = new Logger(AuctionsOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  async insertOpportunities(
    opportunities: AuctionInput[],
    batchSize: number = 500
  ): Promise<number> {
    if (opportunities.length === 0) {
      this.logger.warn('No opportunities to insert');
      return 0;
    }

    this.logger.log(
      { total: opportunities.length, batchSize },
      'Starting batch insert of opportunities'
    );

    let insertedCount = 0;

    // Process in batches
    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      try {
        await this.db
          .insert(domainSchema.opportunityAuctions)
          .values(batch)
          .onConflictDoUpdate({
            target: [domainSchema.opportunityAuctions.externalId],
            set: {
              energyClass: sql`excluded.energy_class`,
              auctionVenue: sql`excluded.auction_venue`,
              currentPrice: sql`excluded.current_price`,
              reservePrice: sql`excluded.reserve_price`,
              lowerEstimate: sql`excluded.lower_estimate`,
              upperEstimate: sql`excluded.upper_estimate`,
              mainPicture: sql`excluded.main_picture`,
              pictures: sql`excluded.pictures`,
              auctionHouseContact: sql`excluded.auction_house_contact`,
            },
          });

        insertedCount += batch.length;

        this.logger.log(
          {
            batchNumber: Math.floor(i / batchSize) + 1,
            inserted: insertedCount,
            total: opportunities.length,
          },
          `Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCount}/${opportunities.length}`
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          { error: errorMessage, batchStart: i },
          'Failed to insert batch'
        );
        throw error;
      }
    }

    this.logger.log(
      { inserted: insertedCount, total: opportunities.length },
      `Successfully inserted ${insertedCount} opportunities`
    );

    return insertedCount;
  }

  async getAllExternalIds(): Promise<string[]> {
    const externalIds = await this.db
      .select({ externalId: domainSchema.opportunityAuctions.externalId })
      .from(domainSchema.opportunityAuctions);
    return externalIds.map(({ externalId }) => externalId);
  }
}
