import type { ISuccessionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";

export class SuccessionService {
  private readonly MAP_VIEW_LIMIT = 500;
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly successionRepository: ISuccessionRepository,
    private readonly exportService: IExportService
  ) {}

  async getSuccessions(filters?: OpportunityFilters): Promise<OpportunitiesListQueryResult<Succession>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const [opportunities, total] = await Promise.all([
      this.successionRepository.findAll(filters),
      this.successionRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getSuccessionById(id: string): Promise<Succession | null> {
    return await this.successionRepository.findById(id);
  }

  async getSuccessionsForMap(filters?: OpportunityFilters): Promise<OpportunitiesMapQueryResult<Succession>> {
    // For map view, limit to avoid performance issues
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: this.MAP_VIEW_LIMIT,
      offset: 0,
    };

    const [opportunities, total] = await Promise.all([
      this.successionRepository.findAll(mapFilters),
      this.successionRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      isLimited: total > this.MAP_VIEW_LIMIT,
    };
  }

  async exportList(filters: OpportunityFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.successionRepository.count(filters);

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
    const successions = await this.successionRepository.findAll(exportFilters);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(successions);
    } 
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(successions);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}