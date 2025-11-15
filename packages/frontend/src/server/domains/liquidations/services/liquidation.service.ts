import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";
import { getOpportunityHeaders } from "~/server/services/export-headers.service";

export class LiquidationService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly liquidationRepository: ILiquidationRepository,
    private readonly exportService: IExportService
  ) {}

  async getLiquidationsData(filters?: OpportunityFilters): Promise<OpportunitiesDataQueryResult<Liquidation>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const opportunities = await this.liquidationRepository.findAll(filters);

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getLiquidationsCount(filters?: OpportunityFilters): Promise<number> {
    return await this.liquidationRepository.count(filters);
  }

  async getLiquidationById(id: string): Promise<Liquidation | null> {
    return await this.liquidationRepository.findById(id);
  }

  async exportList(filters: OpportunityFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.liquidationRepository.count(filters);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(`Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`);
    }

    // Remove pagination from filters to get all results
    const exportFilters: OpportunityFilters = {
      ...filters,
      limit: undefined,
      offset: undefined,
    };

    // Fetch all matching liquidations
    const liquidations = (await this.liquidationRepository.findAll(exportFilters)) as unknown as Record<string, unknown>[];

    // Get French headers for liquidations
    const customHeaders = getOpportunityHeaders(OpportunityType.LIQUIDATION);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(liquidations, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(liquidations, customHeaders);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}