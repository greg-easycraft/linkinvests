import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { DomainDbType } from "~/server/db";
import { energyDiagnostics } from "@linkinvests/db";
import type { IEnergyDiagnosticsRepository } from "../lib.types";
import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import { calculateStartDate } from "~/constants/date-periods";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export class DrizzleEnergyDiagnosticsRepository implements IEnergyDiagnosticsRepository {
  constructor(private readonly db: DomainDbType) {}

  /**
   * Builds where clause for energy diagnostics filters
   * Always filters for F and G energy classes only, as per user requirement
   */
  private buildWhereClause(filters?: OpportunityFilters): SQL[] {
    const conditions: SQL[] = [];

    // ALWAYS filter for F and G energy classes only
    conditions.push(inArray(energyDiagnostics.energyClass, ['E', 'F', 'G']));

    if (!filters) {
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
      // Intersect with F and G classes only
      const allowedClasses = filters.energyClasses.filter(cls => cls === 'F' || cls === 'G');
      if (allowedClasses.length > 0) {
        conditions.push(inArray(energyDiagnostics.energyClass, allowedClasses));
      }
    }

    return conditions;
  }

  async findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<EnergyDiagnostic[]> {
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
    return results.map(this.mapEnergyDiagnostic);
  }

  async findById(id: string): Promise<EnergyDiagnostic | null> {
    const result = await this.db
      .select()
      .from(energyDiagnostics)
      .where(and(
        eq(energyDiagnostics.id, id),
        // Even when fetching by ID, maintain F/G filter as per requirement
        inArray(energyDiagnostics.energyClass, ['F', 'G'])
      ))
      .limit(1);

    return result[0] ? this.mapEnergyDiagnostic(result[0]) : null;
  }

  private mapEnergyDiagnostic(diagnostic: typeof energyDiagnostics.$inferSelect): EnergyDiagnostic {
    return {
      id: diagnostic.id,
      label: diagnostic.label,
      address: diagnostic.address ?? '',
      zipCode: parseInt(diagnostic.zipCode, 10),
      department: parseInt(diagnostic.department, 10),
      latitude: diagnostic.latitude,
      longitude: diagnostic.longitude,
      opportunityDate: diagnostic.opportunityDate,
      externalId: undefined, // Energy diagnostics don't have external IDs
      createdAt: diagnostic.createdAt,
      updatedAt: diagnostic.updatedAt,
      // Energy-specific fields
      energyClass: diagnostic.energyClass ?? undefined,
      dpeNumber: diagnostic.dpeNumber ?? undefined,
    };
  }

  async count(filters?: OpportunityFilters): Promise<number> {
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