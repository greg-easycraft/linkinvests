import type { IOpportunityFilters, PaginationFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export interface IEnergyDiagnosticsRepository {
  findAll(filters?: IOpportunityFilters, paginationFilters?: PaginationFilters): Promise<EnergyDiagnostic[]>;
  findById(id: string): Promise<EnergyDiagnostic | null>;
  findByExternalId(externalId: string): Promise<EnergyDiagnostic | null>;
  count(filters?: IOpportunityFilters): Promise<number>;
}