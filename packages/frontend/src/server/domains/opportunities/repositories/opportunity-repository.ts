import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { OpportunityType } from "@linkinvests/shared";
import type { DomainDbType } from "~/server/db";
import {
  opportunityAuctions,
  opportunitySuccessions,
  opportunityLiquidations,
  energyDiagnostics
} from "@linkinvests/db";
import type {
  IOpportunityRepository,
  Opportunity
} from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";

export class DrizzleOpportunityRepository implements IOpportunityRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Gets the appropriate database table and schema for a given opportunity type
   */
  private getTableForType(type: OpportunityType) {
    switch (type) {
      case OpportunityType.AUCTION:
        return { table: opportunityAuctions, typeName: 'auction' as const };
      case OpportunityType.SUCCESSION:
        return { table: opportunitySuccessions, typeName: 'succession' as const };
      case OpportunityType.LIQUIDATION:
        return { table: opportunityLiquidations, typeName: 'liquidation' as const };
      case OpportunityType.ENERGY_SIEVE:
        return { table: energyDiagnostics, typeName: 'energy_sieve' as const };
      default:
        throw new Error(`Unsupported opportunity type: ${type}`);
    }
  }

  /**
   * Builds where clause for any table type
   */
  private buildWhereClauseForTable(table: any, filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(table.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(table.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          table.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(table.latitude, filters.bounds.south),
          lte(table.latitude, filters.bounds.north),
          gte(table.longitude, filters.bounds.west),
          lte(table.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }

  // Legacy method - now delegates to findAllByType based on filter types
  async findAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    // For backward compatibility, if types filter is provided, query only those types
    // If no types specified, default to auctions
    const typesToQuery = filters?.types?.length ? filters.types : [OpportunityType.AUCTION];

    // For now, we'll only query the first type since UI shows one type at a time
    const primaryType = typesToQuery[0];
    if (!primaryType) {
      return [];
    }
    return this.findAllByType(primaryType, filters);
  }

  async findById(id: string): Promise<Opportunity | null> {
    // Try to find the opportunity in each table since we don't know the type
    // In practice, the UI should know the type and use findByIdAndType instead
    for (const type of Object.values(OpportunityType)) {
      try {
        const result = await this.findByIdAndType(id, type);
        if (result) return result;
      } catch {
        continue; // Type not supported, try next
      }
    }
    return null;
  }

  async count(filters?: OpportunityFilters): Promise<number> {
    // For backward compatibility, count the same types as findAll
    const typesToQuery = filters?.types?.length ? filters.types : [OpportunityType.AUCTION];
    const primaryType = typesToQuery[0];
    if (!primaryType) {
      return 0;
    }
    return this.countByType(primaryType, filters);
  }

  // Type-specific methods (the main implementation)
  async findAllByType(type: OpportunityType, filters?: OpportunityFilters): Promise<Opportunity[]> {
    const { table, typeName } = this.getTableForType(type);
    const conditions = this.buildWhereClauseForTable(table, filters);

    let query = this.db
      .select()
      .from(table)
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && table[filters.sortBy as keyof typeof table]) {
      const column = table[filters.sortBy as keyof typeof table];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${table.createdAt} DESC`);
    }

    const results = await query;

    // Add type annotation to each result
    return results.map((result: Record<string, unknown>) => ({
      ...result,
      type: typeName,
    })) as Opportunity[];
  }

  async findByIdAndType(id: string, type: OpportunityType): Promise<Opportunity | null> {
    const { table, typeName } = this.getTableForType(type);

    const result = await this.db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);

    const opportunity = result[0];
    if (!opportunity) return null;

    // Add type annotation
    return {
      ...opportunity,
      type: typeName,
    } as Opportunity;
  }

  async countByType(type: OpportunityType, filters?: OpportunityFilters): Promise<number> {
    const { table } = this.getTableForType(type);
    const conditions = this.buildWhereClauseForTable(table, filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }
}
