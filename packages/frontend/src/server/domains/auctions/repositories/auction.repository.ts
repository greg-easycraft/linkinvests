import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { opportunityAuctions } from "@linkinvests/db";
import type { IAuctionRepository, } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { Auction } from "@linkinvests/shared";

export class DrizzleAuctionRepository implements IAuctionRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for auction filters
   */
  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

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

    return conditions;
  }

  async findAll(filters?: OpportunityFilters): Promise<Auction[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunityAuctions)
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .$dynamic();

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

  async count(filters?: OpportunityFilters): Promise<number> {
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
      id: auction.id,
      label: auction.label,
      address: auction.address ?? '',
      zipCode: parseInt(auction.zipCode, 10),
      department: parseInt(auction.department, 10),
      latitude: auction.latitude,
      longitude: auction.longitude,
      opportunityDate: auction.opportunityDate,
      externalId: auction.externalId,
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
      // Auction-specific fields
      url: auction.url,
      auctionType: auction.auctionType ?? undefined,
      propertyType: auction.propertyType ?? undefined,
      description: auction.description ?? undefined,
      squareFootage: auction.squareFootage ? Number(auction.squareFootage) : undefined,
      rooms: auction.rooms ?? undefined,
      dpe: auction.dpe ?? undefined,
      auctionVenue: auction.auctionVenue ?? undefined,
      currentPrice: auction.currentPrice ? Number(auction.currentPrice) : undefined,
      reservePrice: auction.reservePrice ? Number(auction.reservePrice) : undefined,
      lowerEstimate: auction.lowerEstimate ? Number(auction.lowerEstimate) : undefined,
      upperEstimate: auction.upperEstimate ? Number(auction.upperEstimate) : undefined,
      mainPicture: auction.mainPicture ?? undefined,
      pictures: auction.pictures ?? undefined,
      auctionHouseContact: auction.auctionHouseContact ?? undefined,
    };
  }
}