import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";
import { getOpportunityHeaders } from "~/server/services/export-headers.service";
import { DEFAULT_PAGE_SIZE } from "~/constants/filters";

export class LiquidationService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly liquidationRepository: ILiquidationRepository,
    private readonly exportService: IExportService
  ) {}

  async getLiquidationsData(filters?: OpportunityFilters): Promise<OpportunitiesDataQueryResult<Liquidation>> {
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = filters?.page ?? 1;
    const offset = (page - 1) * pageSize;

    const opportunities = await this.liquidationRepository.findAll(filters, { limit: pageSize, offset });

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

    // Fetch all matching liquidations
    const liquidations = (await this.liquidationRepository.findAll(filters)) as unknown as Record<string, unknown>[];

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