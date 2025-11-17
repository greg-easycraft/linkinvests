import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export interface IEnergyDiagnosticsRepository {
  findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<EnergyDiagnostic[]>;
  findById(id: string): Promise<EnergyDiagnostic | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}