import { and, between, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { domainSchema } from "@linkinvest/db";
import type { IOpportunityRepository, Opportunity } from "./IOpportunityRepository";
import type { OpportunityFilters } from "../types/filters";

const { opportunities } = domainSchema;

export class DrizzleOpportunityRepository implements IOpportunityRepository {
  constructor(private readonly db: DomainDbType) {}

  async findAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunities)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy) {
      const column = opportunities[filters.sortBy as keyof typeof opportunities];
      if (column) {
        query = query.orderBy(
          filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
        );
      }
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunities.createdAt} DESC`);
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async findById(id: number): Promise<Opportunity | null> {
    const result = await this.db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async count(filters?: OpportunityFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunities)
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
      conditions.push(inArray(opportunities.type, filters.types));
    }

    // Filter by status
    if (filters.status) {
      conditions.push(eq(opportunities.status, filters.status));
    }

    // Filter by department
    if (filters.department) {
      conditions.push(eq(opportunities.department, filters.department));
    }

    // Filter by zipCode
    if (filters.zipCode) {
      conditions.push(eq(opportunities.zipCode, filters.zipCode));
    }

    // Filter by date range
    if (filters.dateRange) {
      conditions.push(
        between(
          opportunities.opportunityDate,
          filters.dateRange.from.toISOString().split("T")[0] ?? "",
          filters.dateRange.to.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunities.latitude, filters.bounds.south),
          lte(opportunities.latitude, filters.bounds.north),
          gte(opportunities.longitude, filters.bounds.west),
          lte(opportunities.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }
}
