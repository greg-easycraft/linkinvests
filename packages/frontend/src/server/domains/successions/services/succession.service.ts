import type { ISuccessionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";
import { getOpportunityHeaders } from "~/server/services/export-headers.service";

export class SuccessionService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly successionRepository: ISuccessionRepository,
    private readonly exportService: IExportService
  ) {}

  async getSuccessionsData(filters?: OpportunityFilters): Promise<OpportunitiesDataQueryResult<Succession>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const opportunities = await this.successionRepository.findAll(filters);

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getSuccessionsCount(filters?: OpportunityFilters): Promise<number> {
    return await this.successionRepository.count(filters);
  }

  async getSuccessionById(id: string): Promise<Succession | null> {
    return await this.successionRepository.findById(id);
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

    // Fetch all matching successions
    const successions = (await this.successionRepository.findAll(exportFilters)) as unknown as Record<string, unknown>[];

    // Get French headers for successions
    const customHeaders = getOpportunityHeaders(OpportunityType.SUCCESSION);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(successions, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(successions, customHeaders);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}