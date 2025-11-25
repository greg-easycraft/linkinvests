import type { IEnergyDiagnosticsRepository } from "../lib.types";
import type { IEnergyDiagnosticFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";
import { getOpportunityHeaders } from "~/server/services/export-headers.service";
import { DEFAULT_PAGE_SIZE } from "~/constants/filters";

export class EnergyDiagnosticsService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly energyDiagnosticsRepository: IEnergyDiagnosticsRepository,
    private readonly exportService: IExportService
  ) {}

  async getEnergyDiagnosticsData(filters?: IEnergyDiagnosticFilters): Promise<OpportunitiesDataQueryResult<EnergyDiagnostic>> {
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = filters?.page ?? 1;

    const offset = (page - 1) * pageSize;

    const opportunities = await this.energyDiagnosticsRepository.findAll(filters, { limit: pageSize, offset });

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getEnergyDiagnosticsCount(filters?: IEnergyDiagnosticFilters): Promise<number> {
    return await this.energyDiagnosticsRepository.count(filters);
  }

  async getEnergyDiagnosticById(id: string): Promise<EnergyDiagnostic | null> {
    return await this.energyDiagnosticsRepository.findById(id);
  }

  async exportList(filters: IEnergyDiagnosticFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.energyDiagnosticsRepository.count(filters);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(`Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`);
    }

    // Fetch all matching energy diagnostics
    const energyDiagnostics = (await this.energyDiagnosticsRepository.findAll(filters)) as unknown as Record<string, unknown>[];

    // Get French headers for energy diagnostics
    const customHeaders = getOpportunityHeaders(OpportunityType.ENERGY_SIEVE);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(energyDiagnostics, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(energyDiagnostics, customHeaders);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}