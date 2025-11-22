import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';
import { eq, lt, sql } from 'drizzle-orm';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import type { Listing } from '@linkinvests/shared';

@Injectable()
export class ListingsOpportunityRepository {
  private readonly logger = new Logger(ListingsOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  /**
   * Creates notary contact JSONB object from opportunity data
   */
  private createsellerContact(opportunity: Listing) {
    return {
      name: opportunity.sellerContact?.name || undefined,
      address: opportunity.sellerContact?.address || undefined,
      phone: opportunity.sellerContact?.phone || undefined,
      email: opportunity.sellerContact?.email || undefined,
      website: opportunity.sellerContact?.website || undefined,
      contact: opportunity.sellerContact?.contact || undefined,
      siret: opportunity.sellerContact?.siret || undefined,
    };
  }

  async insertListings(
    opportunities: Listing[],
    batchSize: number = 500
  ): Promise<number> {
    if (opportunities.length === 0) {
      this.logger.warn('No listings to insert');
      return 0;
    }

    this.logger.log(
      { total: opportunities.length, batchSize },
      'Starting batch insert of listing opportunities'
    );

    let insertedCount = 0;

    // Process in batches
    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      const records = batch.map((opp) => {
        // Extract main picture and additional pictures from pictures array
        const pictures = opp.pictures || [];
        const mainPicture = opp.mainPicture || null;
        const additionalPictures = pictures;

        const sellerContact = this.createsellerContact(opp);

        return {
          source: opp.source,
          // Base opportunity fields
          label: opp.label,
          address: opp.address,
          zipCode: opp.zipCode.toString(),
          department: opp.department.toString().padStart(2, '0'),
          latitude: opp.latitude,
          longitude: opp.longitude,
          opportunityDate: opp.opportunityDate,
          externalId:
            opp.externalId ||
            `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

          // Listing-specific fields
          url: opp.url,
          transactionType: opp.transactionType,
          propertyType: opp.propertyType,
          description: opp.description || null,
          squareFootage: opp.squareFootage || null,
          landArea: opp.landArea || null,
          rooms: opp.rooms || null,
          bedrooms: opp.bedrooms || null,
          energyClass: opp.energyClass,
          constructionYear: opp.constructionYear || null,
          floor: opp.floor || null,
          totalFloors: opp.totalFloors || null,

          // Boolean amenities (stored as JSONB)
          balcony: opp.balcony || null,
          terrace: opp.terrace || null,
          garden: opp.garden || null,
          garage: opp.garage || null,
          parking: opp.parking || null,
          elevator: opp.elevator || null,

          // Price fields
          price: opp.price || null,
          priceType: opp.priceType || null,
          fees: opp.fees || null,
          charges: opp.charges || null,

          // Picture fields
          mainPicture,
          pictures: additionalPictures.length > 0 ? additionalPictures : null,
          sellerType: 'professional',
          // Notary contact info as JSONB
          sellerContact,
        };
      });

      try {
        await this.db
          .insert(domainSchema.opportunityListings)
          .values(records)
          .onConflictDoNothing(); // Skip duplicates based on externalId

        insertedCount += batch.length;

        this.logger.log(
          {
            batchNumber: Math.floor(i / batchSize) + 1,
            inserted: insertedCount,
            total: opportunities.length,
          },
          `Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCount}/${opportunities.length} listings`
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          { error: errorMessage, batchStart: i },
          'Failed to insert listing batch'
        );
        throw error;
      }
    }

    this.logger.log(
      { inserted: insertedCount, total: opportunities.length },
      `Successfully inserted ${insertedCount} listing opportunities`
    );

    return insertedCount;
  }

  /**
   * Get listings by department for testing/debugging
   */
  async getListingsByDepartment(
    department: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const listings = await this.db
        .select()
        .from(domainSchema.opportunityListings)
        .where(eq(domainSchema.opportunityListings.department, department))
        .limit(limit);

      return listings;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        { error: errorMessage, department },
        'Failed to get listings by department'
      );
      throw error;
    }
  }

  /**
   * Get total count of listings in database
   */
  async getTotalListingsCount(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(domainSchema.opportunityListings);

      return result[0]?.count || 0;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        { error: errorMessage },
        'Failed to get total listings count'
      );
      throw error;
    }
  }

  /**
   * Delete listings older than specified date
   */
  async deleteOldListings(olderThan: Date): Promise<number> {
    try {
      const result = await this.db
        .delete(domainSchema.opportunityListings)
        .where(lt(domainSchema.opportunityListings.createdAt, olderThan));

      this.logger.log(
        { deletedCount: result.rowCount || 0, olderThan },
        'Deleted old listings'
      );

      return result.rowCount || 0;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        { error: errorMessage, olderThan },
        'Failed to delete old listings'
      );
      throw error;
    }
  }
}
