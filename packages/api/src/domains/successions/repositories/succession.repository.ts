import { Injectable, Inject } from '@nestjs/common';
import { and, eq, gte, inArray, lte, sql, type SQL } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { opportunitySuccessions } from '@linkinvests/db';
import { SuccessionRepository } from '../lib.types';
import type { ISuccessionFilters, PaginationFilters } from '~/types/filters';
import { calculateStartDate } from '~/constants/date-periods';
import type { Succession } from '@linkinvests/shared';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class DrizzleSuccessionRepository extends SuccessionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {
    super();
  }

  /**
   * Builds where clause for succession filters
   */
  private buildWhereClause(filters?: ISuccessionFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(opportunitySuccessions.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(opportunitySuccessions.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          opportunitySuccessions.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunitySuccessions.latitude, filters.bounds.south),
          lte(opportunitySuccessions.latitude, filters.bounds.north),
          gte(opportunitySuccessions.longitude, filters.bounds.west),
          lte(opportunitySuccessions.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }

  async findAll(filters?: ISuccessionFilters, paginationFilters?: PaginationFilters): Promise<Succession[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunitySuccessions)
      .$dynamic();

    if (paginationFilters) {
      query = query.limit(paginationFilters.limit).offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && opportunitySuccessions[filters.sortBy as keyof typeof opportunitySuccessions]) {
      const column = opportunitySuccessions[filters.sortBy as keyof typeof opportunitySuccessions];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunitySuccessions.createdAt} DESC`);
    }

    const results = await query;
    return results;
  }

  async findById(id: string): Promise<Succession | null> {
    const result = await this.db
      .select()
      .from(opportunitySuccessions)
      .where(eq(opportunitySuccessions.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async count(filters?: ISuccessionFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunitySuccessions)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }
}