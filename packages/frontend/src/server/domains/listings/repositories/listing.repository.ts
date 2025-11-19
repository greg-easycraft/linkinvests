import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { opportunityListings } from "@linkinvests/db";
import type { IListingRepository } from "../lib.types";
import type { ListingFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import { ListingSource, PropertyType, type Listing } from "@linkinvests/shared";

export class DrizzleListingRepository implements IListingRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for listing filters
   */
  private buildWhereClause(filters?: ListingFilters): SQL[] {
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

  async findAll(filters?: ListingFilters, paginationFilters?: PaginationFilters): Promise<Listing[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunityListings)
      .$dynamic();

    if (paginationFilters) {
      query = query.limit(paginationFilters.limit).offset(paginationFilters.offset);
    }

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

  async count(filters?: ListingFilters): Promise<number> {
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
      ...listing,
      source: listing.source as ListingSource,
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
      dpe: listing.dpe ?? undefined,
      constructionYear: listing.constructionYear ?? undefined,
      floor: listing.floor ?? undefined,
      totalFloors: listing.totalFloors ?? undefined,
      balcony: listing.balcony ?? undefined,
      terrace: listing.terrace ?? undefined,
      garden: listing.garden ?? undefined,
      garage: listing.garage ?? undefined,
      parking: listing.parking ?? undefined,
      elevator: listing.elevator ?? undefined,
      price: listing.price ?? undefined,
      priceType: listing.priceType ?? undefined,
      fees: listing.fees ?? undefined,
      charges: listing.charges ?? undefined,
    };
  }
}