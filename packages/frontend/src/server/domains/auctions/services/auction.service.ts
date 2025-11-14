import type { IAuctionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunityType } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";
import { getOpportunityHeaders } from "~/server/services/export-headers.service";

export class AuctionService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly exportService: IExportService
  ) {}


  async getAuctionsData(filters?: OpportunityFilters): Promise<OpportunitiesDataQueryResult<Auction>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const opportunities = await this.auctionRepository.findAll(filters);

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getAuctionsCount(filters?: OpportunityFilters): Promise<number> {
    return await this.auctionRepository.count(filters);
  }


  async getAuctionById(id: string): Promise<Auction | null> {
    return await this.auctionRepository.findById(id);
  }


  async exportList(filters: OpportunityFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.auctionRepository.count(filters);

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
    const auctions = (await this.auctionRepository.findAll(exportFilters)) as unknown as Record<string, unknown>[];

    // Get French headers for auctions
    const customHeaders = getOpportunityHeaders(OpportunityType.AUCTION);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(auctions, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(auctions, customHeaders);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}