import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { opportunityAuctions } from '@linkinvests/db';
import {
  type Auction,
  AuctionOccupationStatus,
  AuctionSource,
  EnergyClass,
  GazClass,
  PropertyType,
} from '@linkinvests/shared';

import { DATABASE_TOKEN } from '~/common/database';
import type { DomainDbType } from '~/types/db';

import { FavoriteAuctionRepository } from '../lib.types';

@Injectable()
export class FavoriteAuctionRepositoryImpl implements FavoriteAuctionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByIds(ids: Array<string>): Promise<Array<Auction>> {
    if (ids.length === 0) return [];

    const results = await this.db
      .select()
      .from(opportunityAuctions)
      .where(inArray(opportunityAuctions.id, ids));

    return results.map((r) => this.mapAuction(r));
  }

  private mapAuction(
    auction: typeof opportunityAuctions.$inferSelect,
  ): Auction {
    return {
      ...auction,
      streetAddress: auction.streetAddress ?? undefined,
      city: auction.city,
      source: auction.source as AuctionSource,
      propertyType: (auction.propertyType ?? undefined) as
        | PropertyType
        | undefined,
      description: auction.description ?? undefined,
      squareFootage: auction.squareFootage ?? undefined,
      rooms: auction.rooms ?? undefined,
      energyClass: (auction.energyClass as EnergyClass) ?? undefined,
      gazClass: (auction.gazClass as GazClass) ?? undefined,
      auctionVenue: auction.auctionVenue ?? undefined,
      currentPrice: auction.currentPrice ?? undefined,
      reservePrice: auction.reservePrice ?? undefined,
      lowerEstimate: auction.lowerEstimate ?? undefined,
      upperEstimate: auction.upperEstimate ?? undefined,
      mainPicture: auction.mainPicture ?? undefined,
      pictures: auction.pictures ?? undefined,
      auctionHouseContact: auction.auctionHouseContact ?? undefined,
      occupationStatus: (auction.occupationStatus ??
        AuctionOccupationStatus.UNKNOWN) as AuctionOccupationStatus,
    };
  }
}
