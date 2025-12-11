import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { opportunityListings } from '@linkinvests/db';
import {
  EnergyClass,
  GazClass,
  type Listing,
  PropertyType,
} from '@linkinvests/shared';

import { DATABASE_TOKEN } from '~/common/database';
import type { DomainDbType } from '~/types/db';

import { FavoriteListingRepository } from '../lib.types';

@Injectable()
export class FavoriteListingRepositoryImpl implements FavoriteListingRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByIds(ids: Array<string>): Promise<Array<Listing>> {
    if (ids.length === 0) return [];

    const results = await this.db
      .select()
      .from(opportunityListings)
      .where(inArray(opportunityListings.id, ids));

    return results.map((r) => this.mapListing(r));
  }

  private mapListing(
    listing: typeof opportunityListings.$inferSelect,
  ): Listing {
    return {
      ...listing,
      lastChangeDate:
        listing.lastChangeDate ?? new Date().toISOString().split('T')[0],
      address: listing.address ?? undefined,
      mainPicture: listing.mainPicture ?? undefined,
      pictures: listing.pictures ?? undefined,
      sellerContact: listing.sellerContact ?? undefined,
      propertyType: listing.propertyType as PropertyType,
      description: listing.description ?? undefined,
      squareFootage: listing.squareFootage ?? undefined,
      landArea: listing.landArea ?? undefined,
      rooms: listing.rooms ?? undefined,
      bedrooms: listing.bedrooms ?? undefined,
      energyClass: listing.energyClass as EnergyClass,
      gazClass: listing.gazClass as GazClass,
      constructionYear: listing.constructionYear ?? undefined,
      floor: listing.floor ?? undefined,
      totalFloors: listing.totalFloors ?? undefined,
      options: listing.options ?? undefined,
      keywords: listing.keywords ?? undefined,
      price: listing.price ?? undefined,
      priceType: listing.priceType ?? undefined,
      fees: listing.fees ?? undefined,
      charges: listing.charges ?? undefined,
      sellerType: listing.sellerType as 'individual' | 'professional',
    };
  }
}
