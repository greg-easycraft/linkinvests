import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { opportunitySuccessions } from "@linkinvests/db";
import type { ISuccessionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { Succession } from "@linkinvests/shared";

export class DrizzleSuccessionRepository implements ISuccessionRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for succession filters
   */
  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
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

  async findAll(filters?: OpportunityFilters): Promise<Succession[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunitySuccessions)
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .$dynamic();

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
    return results.map(this.mapSuccession);
  }

  async findById(id: string): Promise<Succession | null> {
    const result = await this.db
      .select()
      .from(opportunitySuccessions)
      .where(eq(opportunitySuccessions.id, id))
      .limit(1);

    return result[0] ? this.mapSuccession(result[0]) : null;
  }

  private mapSuccession(succession: typeof opportunitySuccessions.$inferSelect): Succession {
    return {
      id: succession.id,
      label: succession.label,
      address: succession.address ?? '',
      zipCode: parseInt(succession.zipCode, 10),
      department: parseInt(succession.department, 10),
      latitude: succession.latitude,
      longitude: succession.longitude,
      opportunityDate: succession.opportunityDate,
      externalId: succession.externalId,
      createdAt: succession.createdAt,
      updatedAt: succession.updatedAt,
      // Succession-specific fields
      firstName: succession.firstName,
      lastName: succession.lastName,
      mairieContact: succession.mairieContact ?? undefined,
    };
  }

  async count(filters?: OpportunityFilters): Promise<number> {
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