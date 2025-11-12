import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";

export class LiquidationService {
  private readonly MAP_VIEW_LIMIT = 500;
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly liquidationRepository: ILiquidationRepository,
    private readonly exportService: IExportService
  ) {}

  async getLiquidations(filters?: OpportunityFilters): Promise<OpportunitiesListQueryResult<Liquidation>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const [opportunities, total] = await Promise.all([
      this.liquidationRepository.findAll(filters),
      this.liquidationRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getLiquidationById(id: string): Promise<Liquidation | null> {
    return await this.liquidationRepository.findById(id);
  }

  async getLiquidationsForMap(filters?: OpportunityFilters): Promise<OpportunitiesMapQueryResult<Liquidation>> {
    // For map view, limit to avoid performance issues
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: this.MAP_VIEW_LIMIT,
      offset: 0,
    };

    const [opportunities, total] = await Promise.all([
      this.liquidationRepository.findAll(mapFilters),
      this.liquidationRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      isLimited: total > this.MAP_VIEW_LIMIT,
    };
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

    // Fetch all matching auctions
    const liquidations = (await this.liquidationRepository.findAll(exportFilters)) as unknown as Record<string, unknown>[];

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(liquidations);
    } 
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(liquidations);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}