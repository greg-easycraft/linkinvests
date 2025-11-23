import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { opportunityListings } from "@linkinvests/db";
import type { IListingRepository } from "../lib.types";
import type { ListingFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import { EnergyClass, PropertyType, type Listing } from "@linkinvests/shared";

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

    // Base OpportunityFilters
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

    // Listing-specific filters
    // Filter by transaction types
    if (filters.transactionTypes && filters.transactionTypes.length > 0) {
      conditions.push(inArray(opportunityListings.transactionType, filters.transactionTypes));
    }

    // Filter by property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(inArray(opportunityListings.propertyType, filters.propertyTypes));
    }

    // Filter by energy classes (DPE)
    if (filters.energyClasses && filters.energyClasses.length > 0) {
      conditions.push(inArray(opportunityListings.energyClass, filters.energyClasses));
    }

    // Filter by price range
    if (filters.priceRange) {
      if (filters.priceRange.min !== undefined) {
        conditions.push(gte(opportunityListings.price, filters.priceRange.min));
      }
      if (filters.priceRange.max !== undefined) {
        conditions.push(lte(opportunityListings.price, filters.priceRange.max));
      }
    }

    // Filter by square footage range
    if (filters.squareFootageRange) {
      if (filters.squareFootageRange.min !== undefined) {
        conditions.push(gte(opportunityListings.squareFootage, filters.squareFootageRange.min));
      }
      if (filters.squareFootageRange.max !== undefined) {
        conditions.push(lte(opportunityListings.squareFootage, filters.squareFootageRange.max));
      }
    }

    // Filter by land area range
    if (filters.landAreaRange) {
      if (filters.landAreaRange.min !== undefined) {
        conditions.push(gte(opportunityListings.landArea, filters.landAreaRange.min));
      }
      if (filters.landAreaRange.max !== undefined) {
        conditions.push(lte(opportunityListings.landArea, filters.landAreaRange.max));
      }
    }

    // Filter by rooms range
    if (filters.roomsRange) {
      if (filters.roomsRange.min !== undefined) {
        conditions.push(gte(opportunityListings.rooms, filters.roomsRange.min));
      }
      if (filters.roomsRange.max !== undefined) {
        conditions.push(lte(opportunityListings.rooms, filters.roomsRange.max));
      }
    }

    // Filter by bedrooms range
    if (filters.bedroomsRange) {
      if (filters.bedroomsRange.min !== undefined) {
        conditions.push(gte(opportunityListings.bedrooms, filters.bedroomsRange.min));
      }
      if (filters.bedroomsRange.max !== undefined) {
        conditions.push(lte(opportunityListings.bedrooms, filters.bedroomsRange.max));
      }
    }

    // Filter by construction year range
    if (filters.constructionYearRange) {
      if (filters.constructionYearRange.min !== undefined) {
        conditions.push(gte(opportunityListings.constructionYear, filters.constructionYearRange.min));
      }
      if (filters.constructionYearRange.max !== undefined) {
        conditions.push(lte(opportunityListings.constructionYear, filters.constructionYearRange.max));
      }
    }

    // Filter by features
    if (filters.features) {
      if (filters.features.balcony !== undefined) {
        conditions.push(eq(opportunityListings.balcony, filters.features.balcony));
      }
      if (filters.features.terrace !== undefined) {
        conditions.push(eq(opportunityListings.terrace, filters.features.terrace));
      }
      if (filters.features.garden !== undefined) {
        conditions.push(eq(opportunityListings.garden, filters.features.garden));
      }
      if (filters.features.garage !== undefined) {
        conditions.push(eq(opportunityListings.garage, filters.features.garage));
      }
      if (filters.features.parking !== undefined) {
        conditions.push(eq(opportunityListings.parking, filters.features.parking));
      }
      if (filters.features.elevator !== undefined) {
        conditions.push(eq(opportunityListings.elevator, filters.features.elevator));
      }
    }

    // Filter by rental status (isSoldRented)
    if (filters.isSoldRented !== undefined) {
      conditions.push(eq(opportunityListings.isSoldRented, filters.isSoldRented));
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
      sellerType: listing.sellerType as 'individual' | 'professional',
    };
  }
}