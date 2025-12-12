import { Injectable, Inject } from '@nestjs/common';
import { and, gte, inArray, lte, sql, type SQL } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { allOpportunities } from '@linkinvests/db';
import { AllOpportunitiesRepository } from '../lib.types';
import type { IAllOpportunitiesFilters, PaginationFilters } from '~/types';
import { calculateStartDate } from '~/constants';
import { type AllOpportunity, OpportunityType } from '@linkinvests/shared';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class AllOpportunitiesRepositoryImpl implements AllOpportunitiesRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  /**
   * Builds where clause for all-opportunities filters
   */
  private buildWhereClause(filters?: IAllOpportunitiesFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by opportunity types
    if (filters.types && filters.types.length > 0) {
      conditions.push(inArray(allOpportunities.type, filters.types));
    }

    // Base IOpportunityFilters
    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(
        inArray(allOpportunities.department, filters.departments),
      );
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(allOpportunities.zipCode, filters.zipCodes));
    }

    if (filters.dateAfter) {
      const dateThreshold = calculateStartDate(filters.dateAfter);
      conditions.push(
        gte(
          allOpportunities.opportunityDate,
          dateThreshold.toISOString().split('T')[0] ?? '',
        ),
      );
    }

    if (filters.dateBefore) {
      const dateUntil = calculateStartDate(filters.dateBefore);
      conditions.push(
        lte(
          allOpportunities.opportunityDate,
          dateUntil.toISOString().split('T')[0] ?? '',
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(allOpportunities.latitude, filters.bounds.south),
          lte(allOpportunities.latitude, filters.bounds.north),
          gte(allOpportunities.longitude, filters.bounds.west),
          lte(allOpportunities.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    // Extended filters (available when applicable types are selected)
    // Filter by energy classes
    if (filters.energyClasses && filters.energyClasses.length > 0) {
      conditions.push(
        inArray(allOpportunities.energyClass, filters.energyClasses),
      );
    }

    // Filter by square footage range
    if (filters.minSquareFootage !== undefined) {
      conditions.push(
        gte(allOpportunities.squareFootage, filters.minSquareFootage),
      );
    }
    if (filters.maxSquareFootage !== undefined) {
      conditions.push(
        lte(allOpportunities.squareFootage, filters.maxSquareFootage),
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      conditions.push(gte(allOpportunities.price, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(allOpportunities.price, filters.maxPrice));
    }

    return conditions;
  }

  async findAll(
    filters?: IAllOpportunitiesFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<AllOpportunity[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db.select().from(allOpportunities).$dynamic();

    if (paginationFilters) {
      query = query
        .limit(paginationFilters.limit)
        .offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortField = filters?.sortBy;
    if (
      sortField &&
      allOpportunities[sortField as keyof typeof allOpportunities]
    ) {
      const column =
        allOpportunities[sortField as keyof typeof allOpportunities];
      query = query.orderBy(
        filters?.sortOrder === 'desc'
          ? sql`${column} DESC`
          : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${allOpportunities.createdAt} DESC`);
    }

    const results = await query;
    return results.map(this.mapOpportunity);
  }

  async count(filters?: IAllOpportunitiesFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(allOpportunities)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  private mapOpportunity = (
    row: typeof allOpportunities.$inferSelect,
  ): AllOpportunity => ({
    id: row.opportunityId, // Use opportunityId as id for BaseOpportunity compatibility
    opportunityId: row.opportunityId,
    type: row.type as OpportunityType,
    label: row.label,
    address: row.address ?? undefined,
    zipCode: row.zipCode,
    department: row.department,
    latitude: row.latitude,
    longitude: row.longitude,
    opportunityDate: row.opportunityDate,
    externalId: row.externalId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    energyClass: row.energyClass ?? undefined,
    squareFootage: row.squareFootage ?? undefined,
    price: row.price ?? undefined,
  });
}
