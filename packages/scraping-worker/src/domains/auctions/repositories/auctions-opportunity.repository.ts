import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import type { AuctionOpportunity } from '../types';
import { sql } from 'drizzle-orm';

@Injectable()
export class AuctionsOpportunityRepository {
  private readonly logger = new Logger(AuctionsOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  /**
   * Creates auction house contact JSONB object from venue information
   */
  private createAuctionHouseContact(auctionVenue?: string) {
    return {
      name: auctionVenue || undefined,
      address: undefined, // Not available from current scraping
      phone: undefined,
      email: undefined,
      auctioneer: undefined,
      registrationRequired: undefined,
      depositAmount: undefined,
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

        const auctionHouseContact = this.createAuctionHouseContact(
          opp.extraData?.auctionVenue
        );

        // Extract main picture and additional pictures from images array
        const images = opp.pictures || [];
        const mainPicture =
          opp.mainPicture || (images.length > 0 ? images[0] : null);
        const additionalPictures = images.length > 1 ? images.slice(1) : [];

        return {
          // Base opportunity fields
          label: opp.label,
          address: opp.address,
          zipCode: opp.zipCode,
          department: opp.department.toString().padStart(2, '0'),
          latitude: opp.latitude,
          longitude: opp.longitude,
          opportunityDate: opp.auctionDate,
          externalId: auctionId,
          source: opp.source,
          // Auction-specific fields (normalized from extraData)
          url: opp.url,
          propertyType: opp.extraData?.propertyType || null,
          description: opp.extraData?.description || null,
          squareFootage: opp.extraData?.squareFootage || null,
          rooms: opp.extraData?.rooms || null,
          energyClass: opp.extraData?.energyClass || null,
          auctionVenue: opp.extraData?.auctionVenue || null,

          // Price fields (normalized from extraData)
          currentPrice: opp.extraData?.currentPrice || null,
          reservePrice: opp.extraData?.reservePrice || null,
          lowerEstimate: opp.extraData?.lowerEstimate || null,
          upperEstimate: opp.extraData?.upperEstimate || null,

          // Picture fields (normalized from images array)
          mainPicture,
          pictures: additionalPictures.length > 0 ? additionalPictures : null,

          // Auction house contact info as JSONB
          auctionHouseContact,
        };
      });

      try {
        await this.db
          .insert(domainSchema.opportunityAuctions)
          .values(records)
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
}
