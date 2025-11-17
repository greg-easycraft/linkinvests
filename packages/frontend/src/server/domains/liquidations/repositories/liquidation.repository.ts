import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { opportunityLiquidations } from "@linkinvests/db";
import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { Liquidation } from "@linkinvests/shared";

export class DrizzleLiquidationRepository implements ILiquidationRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for liquidation filters
   */
  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      return conditions;
    }

    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(opportunityLiquidations.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(opportunityLiquidations.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          opportunityLiquidations.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(opportunityLiquidations.latitude, filters.bounds.south),
          lte(opportunityLiquidations.latitude, filters.bounds.north),
          gte(opportunityLiquidations.longitude, filters.bounds.west),
          lte(opportunityLiquidations.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    return conditions;
  }

  async findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<Liquidation[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(opportunityLiquidations)
      .$dynamic();

    if (paginationFilters) {
      query = query.limit(paginationFilters.limit).offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && opportunityLiquidations[filters.sortBy as keyof typeof opportunityLiquidations]) {
      const column = opportunityLiquidations[filters.sortBy as keyof typeof opportunityLiquidations];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${opportunityLiquidations.createdAt} DESC`);
    }

    const results = await query;
    return results.map(this.mapLiquidation);
  }

  async findById(id: string): Promise<Liquidation | null> {
    const result = await this.db
      .select()
      .from(opportunityLiquidations)
      .where(eq(opportunityLiquidations.id, id))
      .limit(1);

    return result[0] ? this.mapLiquidation(result[0]) : null;
  }

  private mapLiquidation(liquidation: typeof opportunityLiquidations.$inferSelect): Liquidation {
    return {
      id: liquidation.id,
      label: liquidation.label,
      address: liquidation.address ?? '',
      zipCode: parseInt(liquidation.zipCode, 10),
      department: parseInt(liquidation.department, 10),
      latitude: liquidation.latitude,
      longitude: liquidation.longitude,
      opportunityDate: liquidation.opportunityDate,
      externalId: undefined, // Liquidations don't have external IDs
      createdAt: liquidation.createdAt,
      updatedAt: liquidation.updatedAt,
      // Liquidation-specific fields
      siret: liquidation.siret,
      companyContact: liquidation.companyContact ?? undefined,
    };
  }

  async count(filters?: OpportunityFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(opportunityLiquidations)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }
}