import { and, eq, gte, inArray, lte } from "drizzle-orm";
import type { DomainDbType } from "~/types/db";
import { energyDiagnostics } from "@linkinvests/db";
import { MAX_NUMBER_OF_RESULTS, type IAddressSearchRepository } from "../lib.types";
import type { DiagnosticQueryInput } from "../lib.types";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export class DrizzleAddressSearchRepository implements IAddressSearchRepository {
  constructor(private readonly db: DomainDbType) {}

  async findAllForAddressSearch(input: DiagnosticQueryInput): Promise<EnergyDiagnostic[]> {
    const query = this.db
      .select()
      .from(energyDiagnostics)
      .where(and(
        eq(energyDiagnostics.zipCode, input.zipCode),
        eq(energyDiagnostics.energyClass, input.energyClass),
        gte(energyDiagnostics.squareFootage, input.squareFootageMin),
        lte(energyDiagnostics.squareFootage, input.squareFootageMax),
      ))
      .limit(MAX_NUMBER_OF_RESULTS);
    const results = await query;
    return results;
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

    return result[0] ?? null;
  }
}