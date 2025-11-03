import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';
import { OpportunityType, type AuctionHouseContactData } from '@linkinvests/shared';
import { sql } from 'drizzle-orm';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import type { AuctionOpportunity } from '../types';

@Injectable()
export class AuctionsOpportunityRepository {
  private readonly logger = new Logger(AuctionsOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  /**
   * Extracts external ID from auction URL
   * Example: https://www.encheres-publiques.com/px/encheres/vente/12345/detail.htm -> encheres-publiques-12345
   */
  private extractExternalId(url: string): string {
    const match = url.match(/vente\/(\d+)/);
    return match ? `encheres-publiques-${match[1]}` : url;
  }

  /**
   * Converts auction venue information to contact data
   */
  private createContactData(auctionVenue?: string): AuctionHouseContactData | null {
    if (!auctionVenue) return null;

    return {
      type: 'auction_house',
      name: auctionVenue,
      address: '', // Not available from current scraping
      // Additional fields could be populated if available from scraping
    };
  }

  async insertOpportunities(
    opportunities: AuctionOpportunity[],
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

      const records = batch.map((opp) => ({
        label: opp.label,
        siret: null, // Not applicable for auctions
        address: opp.address,
        zipCode: opp.zipCode,
        department: opp.department,
        latitude: opp.latitude,
        longitude: opp.longitude,
        type: OpportunityType.AUCTION,
        status: 'pending_review',
        opportunityDate: opp.auctionDate,
        externalId: this.extractExternalId(opp.url),
        contactData: this.createContactData(opp.extraData?.auctionVenue),
        extraData: opp.extraData || null,
        images: opp.images || null,
      }));

      try {
        await this.db
          .insert(domainSchema.opportunities)
          .values(records)
          .onConflictDoUpdate({
            target: [domainSchema.opportunities.externalId, domainSchema.opportunities.type],
            set: {
              label: sql`EXCLUDED.label`,
              address: sql`EXCLUDED.address`,
              zipCode: sql`EXCLUDED.zip_code`,
              department: sql`EXCLUDED.department`,
              latitude: sql`EXCLUDED.latitude`,
              longitude: sql`EXCLUDED.longitude`,
              status: sql`EXCLUDED.status`,
              opportunityDate: sql`EXCLUDED.opportunity_date`,
              contactData: sql`EXCLUDED.contact_data`,
              extraData: sql`EXCLUDED.extra_data`,
              images: sql`EXCLUDED.images`,
              updatedAt: sql`CURRENT_TIMESTAMP`,
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
}
