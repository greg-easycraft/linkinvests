import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { opportunityListings } from "@linkinvests/db";
import type { IListingRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { Listing } from "@linkinvests/shared";

export class DrizzleListingRepository implements IListingRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for listing filters
   */
  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(opportunityListings.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(opportunityListings.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          opportunityListings.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunityListings.latitude, filters.bounds.south),
          lte(opportunityListings.latitude, filters.bounds.north),
          gte(opportunityListings.longitude, filters.bounds.west),
          lte(opportunityListings.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }

  async findAll(filters?: OpportunityFilters): Promise<Listing[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunityListings)
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && opportunityListings[filters.sortBy as keyof typeof opportunityListings]) {
      const column = opportunityListings[filters.sortBy as keyof typeof opportunityListings];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunityListings.createdAt} DESC`);
    }

    const results = await query;
    return results.map(this.mapListing);
  }

  async findById(id: string): Promise<Listing | null> {
    const result = await this.db
      .select()
      .from(opportunityListings)
      .where(eq(opportunityListings.id, id))
      .limit(1);

    return result[0] ? this.mapListing(result[0]) : null;
  }

  async count(filters?: OpportunityFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunityListings)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  private mapListing(listing: typeof opportunityListings.$inferSelect): Listing {
    return {
      id: listing.id,
      label: listing.label,
      address: listing.address ?? '',
      zipCode: parseInt(listing.zipCode, 10),
      department: parseInt(listing.department, 10),
      latitude: listing.latitude,
      longitude: listing.longitude,
      opportunityDate: listing.opportunityDate,
      externalId: listing.externalId,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      // Listing-specific fields
      url: listing.url,
      transactionType: listing.transactionType ?? undefined,
      propertyType: listing.propertyType ?? undefined,
      description: listing.description ?? undefined,
      squareFootage: listing.squareFootage ? Number(listing.squareFootage) : undefined,
      rooms: listing.rooms ?? undefined,
      dpe: listing.dpe ?? undefined,
      price: listing.price ? Number(listing.price) : undefined,
      mainPicture: listing.mainPicture ?? undefined,
      pictures: listing.pictures ?? undefined,
      notaryContact: listing.notaryContact ?? undefined,
    };
  }
}