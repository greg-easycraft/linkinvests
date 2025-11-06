import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';
import {
  OpportunityType,
  type AuctionHouseContactData,
} from '@linkinvests/shared';

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
   * Creates external ID from auction ID
   * Example: auction ID "120597" -> "encheres-publiques-120597"
   */
  private createExternalId(auctionId: string): string {
    return `encheres-publiques-${auctionId}`;
  }

  /**
   * Converts auction venue information to contact data
   */
  private createContactData(
    auctionVenue?: string
  ): AuctionHouseContactData | null {
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

      const records = batch.map((opp) => {
        // Ensure we have an auction ID for externalId
        const auctionId = opp.extraData?.id;
        if (!auctionId) {
          throw new Error(`Missing auction ID for opportunity: ${opp.url}`);
        }

        // Add URL to extraData
        const extraDataWithUrl = {
          ...opp.extraData,
          url: opp.url,
        };

        return {
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
          externalId: this.createExternalId(auctionId),
          contactData: this.createContactData(opp.extraData?.auctionVenue),
          extraData: extraDataWithUrl,
          images: opp.images || null,
        };
      });

      try {
        await this.db
          .insert(domainSchema.opportunities)
          .values(records)
          .onConflictDoNothing();

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
