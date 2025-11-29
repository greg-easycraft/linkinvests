import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { energyDiagnostics } from "@linkinvests/db";
import type { IEnergyDiagnosticsRepository } from "../lib.types";
import type { IEnergyDiagnosticFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { DEFAULT_PAGE_SIZE } from "~/constants/filters";

export class DrizzleEnergyDiagnosticsRepository implements IEnergyDiagnosticsRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for energy diagnostics filters
   * Always filters for F and G energy classes only, as per user requirement
   */
  private buildWhereClause(filters?: IEnergyDiagnosticFilters): SQL[] {
    const conditions: SQL[] = [];

    if (!filters) {
      conditions.push(inArray(energyDiagnostics.energyClass, ['E', 'F', 'G']));
      return conditions;
    }

    // Filter by departments (support multiple departments)
    if (filters.departments && filters.departments.length > 0) {
      conditions.push(inArray(energyDiagnostics.department, filters.departments));
    }

    // Filter by zipCodes (support multiple zip codes)
    if (filters.zipCodes && filters.zipCodes.length > 0) {
      conditions.push(inArray(energyDiagnostics.zipCode, filters.zipCodes));
    }

    if (filters.datePeriod) {
      const dateThreshold = calculateStartDate(filters.datePeriod);
      conditions.push(
        gte(
          energyDiagnostics.opportunityDate,
          dateThreshold.toISOString().split("T")[0] ?? "",
        ),
      );
    }

    // Filter by map bounds
    if (filters.bounds) {
      conditions.push(
        and(
          gte(energyDiagnostics.latitude, filters.bounds.south),
          lte(energyDiagnostics.latitude, filters.bounds.north),
          gte(energyDiagnostics.longitude, filters.bounds.west),
          lte(energyDiagnostics.longitude, filters.bounds.east),
        ) ?? sql`true`,
      );
    }

    // Additional energy class filtering if specified in filters
    // Note: This will intersect with the mandatory F/G filter above
    if (filters.energyClasses && filters.energyClasses.length > 0) {
      // Intersect with E, F and G classes only
      const allowedClasses = filters.energyClasses.filter(cls => ['E', 'F', 'G'].includes(cls));
      if (allowedClasses.length > 0) {
        conditions.push(inArray(energyDiagnostics.energyClass, allowedClasses));
      }
    } else {
      conditions.push(inArray(energyDiagnostics.energyClass, ['E', 'F', 'G']));
    }

    return conditions;
  }

  async findAll(filters?: IEnergyDiagnosticFilters, paginationFilters: PaginationFilters = { limit: DEFAULT_PAGE_SIZE, offset: 0 }): Promise<EnergyDiagnostic[]> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select()
      .from(energyDiagnostics)
      .$dynamic();

    if (paginationFilters) {
      query = query.limit(paginationFilters.limit).offset(paginationFilters.offset);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (filters?.sortBy && energyDiagnostics[filters.sortBy as keyof typeof energyDiagnostics]) {
      const column = energyDiagnostics[filters.sortBy as keyof typeof energyDiagnostics];
      query = query.orderBy(
        filters.sortOrder === "desc" ? sql`${column} DESC` : sql`${column} ASC`,
      );
    } else {
      // Default sorting by creation date
      query = query.orderBy(sql`${energyDiagnostics.createdAt} DESC`);
    }

    const results = await query;
    return results;
  }

  async findById(id: string): Promise<EnergyDiagnostic | null> {
    const result = await this.db
      .select()
      .from(energyDiagnostics)
      .where(and(
        eq(energyDiagnostics.id, id)
      ))
      .limit(1);

    return result[0] ?? null;
  }

  async count(filters?: IEnergyDiagnosticFilters): Promise<number> {
    const conditions = this.buildWhereClause(filters);

    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(energyDiagnostics)
      .$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }
}