import type { IEnergyDiagnosticsRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

export class EnergyDiagnosticsService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly energyDiagnosticsRepository: IEnergyDiagnosticsRepository) {}

  async getEnergyDiagnostics(filters?: OpportunityFilters): Promise<OpportunitiesListQueryResult<EnergyDiagnostic>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const [opportunities, total] = await Promise.all([
      this.energyDiagnosticsRepository.findAll(filters),
      this.energyDiagnosticsRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getEnergyDiagnosticById(id: string): Promise<EnergyDiagnostic | null> {
    return await this.energyDiagnosticsRepository.findById(id);
  }

  async getEnergyDiagnosticsForMap(filters?: OpportunityFilters): Promise<OpportunitiesMapQueryResult<EnergyDiagnostic>> {
    // For map view, limit to avoid performance issues
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: this.MAP_VIEW_LIMIT,
      offset: 0,
    };

    const [opportunities, total] = await Promise.all([
      this.energyDiagnosticsRepository.findAll(mapFilters),
      this.energyDiagnosticsRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      isLimited: total > this.MAP_VIEW_LIMIT,
    };
  }
}