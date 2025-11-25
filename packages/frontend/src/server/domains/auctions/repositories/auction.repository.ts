import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { opportunityAuctions } from "@linkinvests/db";
import type { IAuctionRepository, } from "../lib.types";
import type { IAuctionFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import { AuctionSource, PropertyType, EnergyClass, type Auction } from "@linkinvests/shared";

export class DrizzleAuctionRepository implements IAuctionRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for auction filters
   */
  private buildWhereClause(filters?: IAuctionFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Base IOpportunityFilters
    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(opportunityAuctions.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(opportunityAuctions.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          opportunityAuctions.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunityAuctions.latitude, filters.bounds.south),
          lte(opportunityAuctions.latitude, filters.bounds.north),
          gte(opportunityAuctions.longitude, filters.bounds.west),
          lte(opportunityAuctions.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    // Auction-specific filters
    // Filter by property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(inArray(opportunityAuctions.propertyType, filters.propertyTypes));
    }

    // Filter by auction venues
    if (filters.auctionVenues && filters.auctionVenues.length > 0) {
      conditions.push(inArray(opportunityAuctions.auctionVenue, filters.auctionVenues));
    }

    // Filter by energy classes (DPE)
    if (filters.energyClasses && filters.energyClasses.length > 0) {
      conditions.push(inArray(opportunityAuctions.energyClass, filters.energyClasses));
    }

    // Filter by price range (current price)
    if (filters.minPrice !== undefined) {
      conditions.push(gte(opportunityAuctions.currentPrice, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(opportunityAuctions.currentPrice, filters.maxPrice));
    }

    // Filter by reserve price range
    if (filters.minReservePrice !== undefined) {
      conditions.push(gte(opportunityAuctions.reservePrice, filters.minReservePrice));
    }
    if (filters.maxReservePrice !== undefined) {
      conditions.push(lte(opportunityAuctions.reservePrice, filters.maxReservePrice));
    }

    // Filter by square footage range
    if (filters.minSquareFootage !== undefined) {
      conditions.push(gte(opportunityAuctions.squareFootage, filters.minSquareFootage));
    }
    if (filters.maxSquareFootage !== undefined) {
      conditions.push(lte(opportunityAuctions.squareFootage, filters.maxSquareFootage));
    }

    // Filter by rooms range
    if (filters.minRooms !== undefined) {
      conditions.push(gte(opportunityAuctions.rooms, filters.minRooms));
    }
    if (filters.maxRooms !== undefined) {
      conditions.push(lte(opportunityAuctions.rooms, filters.maxRooms));
    }

    // Filter by rental status (isSoldRented)
    if (filters.isSoldRented !== undefined) {
      conditions.push(eq(opportunityAuctions.isSoldRented, filters.isSoldRented));
    }

    return conditions;
  }

  async findAll(filters?: IAuctionFilters, paginationFilters?: PaginationFilters): Promise<Auction[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunityAuctions)
      .$dynamic();

    if (paginationFilters) {
      query = query.limit(paginationFilters.limit).offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && opportunityAuctions[filters.sortBy as keyof typeof opportunityAuctions]) {
      const column = opportunityAuctions[filters.sortBy as keyof typeof opportunityAuctions];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunityAuctions.createdAt} DESC`);
    }

    const results = await query;
    return results.map(this.mapAuction);
  }

  async findById(id: string): Promise<Auction | null> {
    const result = await this.db
      .select()
      .from(opportunityAuctions)
      .where(eq(opportunityAuctions.id, id))
      .limit(1);

    return result[0] ? this.mapAuction(result[0]) : null;
  }

  async count(filters?: IAuctionFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunityAuctions)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  private mapAuction(auction: typeof opportunityAuctions.$inferSelect): Auction {
    return {
      ...auction,
      address: auction.address ?? undefined,
      source: auction.source as AuctionSource,
      propertyType: (auction.propertyType ?? undefined) as PropertyType | undefined,
      description: auction.description ?? undefined,
      squareFootage: auction.squareFootage ?? undefined,
      rooms: auction.rooms ?? undefined,
      energyClass: auction.energyClass as EnergyClass ?? undefined,
      auctionVenue: auction.auctionVenue ?? undefined,
      currentPrice: auction.currentPrice ?? undefined,
      reservePrice: auction.reservePrice ?? undefined,
      lowerEstimate: auction.lowerEstimate ?? undefined,
      upperEstimate: auction.upperEstimate ?? undefined,
      mainPicture: auction.mainPicture ?? undefined,
      pictures: auction.pictures ?? undefined,
      auctionHouseContact: auction.auctionHouseContact ?? undefined,
    };
  }
}