import { and, between, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { opportunities as opportunitiesTable } from "@linkinvests/db";
import type { IOpportunityRepository, Opportunity } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";

export class DrizzleOpportunityRepository implements IOpportunityRepository {
  constructor(private readonly db: DomainDbType) {}

  async findAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunitiesTable)
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy) {
      const column = opportunitiesTable[filters.sortBy as keyof typeof opportunitiesTable];
      if (column) {
        query = query.orderBy(
          filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
        );
      }
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunitiesTable.createdAt} DESC`);
    }

    return await query;
  }

  async findById(id: number): Promise<Opportunity | null> {
    const result = await this.db
      .select()
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async count(filters?: OpportunityFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunitiesTable)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by types
    if (filters.types && filters.types.length > 0) {
      conditions.push(inArray(opportunitiesTable.type, filters.types));
    }

    // Filter by department
    if (filters.department) {
      conditions.push(eq(opportunitiesTable.department, filters.department));
    }

    // Filter by zipCode
    if (filters.zipCode) {
      conditions.push(eq(opportunitiesTable.zipCode, filters.zipCode));
    }

    // Filter by date range
    if (filters.dateRange) {
      conditions.push(
        between(
          opportunitiesTable.opportunityDate,
          filters.dateRange.from.toISOString().split("T")[0] ?? "",
          filters.dateRange.to.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunitiesTable.latitude, filters.bounds.south),
          lte(opportunitiesTable.latitude, filters.bounds.north),
          gte(opportunitiesTable.longitude, filters.bounds.west),
          lte(opportunitiesTable.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }
}
