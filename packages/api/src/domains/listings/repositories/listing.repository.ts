import { Injectable, Inject } from '@nestjs/common';
import {
  and,
  arrayContains,
  eq,
  gte,
  inArray,
  lte,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { opportunityListings } from '@linkinvests/db';
import { ListingRepository } from '../lib.types';
import type { IListingFilters, PaginationFilters } from '~/types';
import { calculateStartDate } from '~/constants';
import {
  EnergyClass,
  GazClass,
  PropertyType,
  type Listing,
} from '@linkinvests/shared';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class DrizzleListingRepository extends ListingRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {
    super();
  }

  /**
   * Builds where clause for listing filters
   */
  private buildWhereClause(filters?: IListingFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Base IOpportunityFilters
    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(
        inArray(opportunityListings.department, filters.departments),
      );
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(opportunityListings.zipCode, filters.zipCodes));
    }

    if (filters.isDivisible !== undefined) {
      conditions.push(
        arrayContains(opportunityListings.options, ['isDivisible']),
      );
    }

    if (filters.hasWorksRequired !== undefined) {
      conditions.push(
        arrayContains(opportunityListings.options, ['hasWorksRequired']),
      );
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          opportunityListings.opportunityDate,
          dateThreshold.toISOString().split('T')[0] ?? '',
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
    // Filter by property types
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(
        inArray(opportunityListings.propertyType, filters.propertyTypes),
      );
    }

    // Filter by energy classes (DPE)
    if (filters.energyClasses && filters.energyClasses.length > 0) {
      conditions.push(
        inArray(opportunityListings.energyClass, filters.energyClasses),
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      conditions.push(gte(opportunityListings.price, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(opportunityListings.price, filters.maxPrice));
    }

    // Filter by square footage range
    if (filters.minSquareFootage !== undefined) {
      conditions.push(
        gte(opportunityListings.squareFootage, filters.minSquareFootage),
      );
    }
    if (filters.maxSquareFootage !== undefined) {
      conditions.push(
        lte(opportunityListings.squareFootage, filters.maxSquareFootage),
      );
    }

    // Filter by land area range
    if (filters.minLandArea !== undefined) {
      conditions.push(gte(opportunityListings.landArea, filters.minLandArea));
    }
    if (filters.maxLandArea !== undefined) {
      conditions.push(lte(opportunityListings.landArea, filters.maxLandArea));
    }

    // Filter by rooms range
    if (filters.minRooms !== undefined) {
      conditions.push(gte(opportunityListings.rooms, filters.minRooms));
    }
    if (filters.maxRooms !== undefined) {
      conditions.push(lte(opportunityListings.rooms, filters.maxRooms));
    }

    // Filter by bedrooms range
    if (filters.minBedrooms !== undefined) {
      conditions.push(gte(opportunityListings.bedrooms, filters.minBedrooms));
    }
    if (filters.maxBedrooms !== undefined) {
      conditions.push(lte(opportunityListings.bedrooms, filters.maxBedrooms));
    }

    // Filter by construction year range
    if (filters.minConstructionYear !== undefined) {
      conditions.push(
        gte(opportunityListings.constructionYear, filters.minConstructionYear),
      );
    }
    if (filters.maxConstructionYear !== undefined) {
      conditions.push(
        lte(opportunityListings.constructionYear, filters.maxConstructionYear),
      );
    }

    // Filter by rental status (isSoldRented)
    if (filters.isSoldRented !== undefined) {
      conditions.push(
        eq(opportunityListings.isSoldRented, filters.isSoldRented),
      );
    }

    // Filter by sources
    if (filters.sources && filters.sources.length > 0) {
      conditions.push(inArray(opportunityListings.source, filters.sources));
    }

    // Filter by seller type
    if (filters.sellerType) {
      conditions.push(eq(opportunityListings.sellerType, filters.sellerType));
    }

    return conditions;
  }

  async findAll(
    filters?: IListingFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<Listing[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db.select().from(opportunityListings).$dynamic();

    if (paginationFilters) {
      query = query
        .limit(paginationFilters.limit)
        .offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (
      filters?.sortBy &&
      opportunityListings[filters.sortBy as keyof typeof opportunityListings]
    ) {
      const column =
        opportunityListings[filters.sortBy as keyof typeof opportunityListings];
      query = query.orderBy(
        filters.sortOrder === 'desc' ? sql`${column} DESC` : sql`${column} ASC`,
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

  async count(filters?: IListingFilters): Promise<number> {
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

  async getDistinctSources(): Promise<string[]> {
    const results = await this.db
      .selectDistinct({ source: opportunityListings.source })
      .from(opportunityListings);
    return results.map((r) => r.source).filter(Boolean);
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
