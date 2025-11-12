import type { IEnergyDiagnosticsRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";

export class EnergyDiagnosticsService {
  private readonly MAP_VIEW_LIMIT = 500;
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly energyDiagnosticsRepository: IEnergyDiagnosticsRepository,
    private readonly exportService: IExportService
  ) {}

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

  async exportList(filters: OpportunityFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.energyDiagnosticsRepository.count(filters);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(`Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`);
    }

    // Remove pagination from filters to get all results
    const exportFilters: OpportunityFilters = {
      ...filters,
      limit: undefined,
      offset: undefined,
    };

    // Fetch all matching auctions
    const energyDiagnostics = await this.energyDiagnosticsRepository.findAll(exportFilters);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(energyDiagnostics);
    } 
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(energyDiagnostics);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}