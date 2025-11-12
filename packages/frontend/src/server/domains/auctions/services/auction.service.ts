import type { IAuctionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { IExportService, ExportFormat } from "~/server/services/export.service";

export class AuctionService {
  private readonly MAP_VIEW_LIMIT = 500;
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly exportService: IExportService
  ) {}

  async getAuctions(filters?: OpportunityFilters): Promise<OpportunitiesListQueryResult<Auction>> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const [opportunities, total] = await Promise.all([
      this.auctionRepository.findAll(filters),
      this.auctionRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getAuctionById(id: string): Promise<Auction | null> {
    return await this.auctionRepository.findById(id);
  }

  async getAuctionsForMap(filters?: OpportunityFilters): Promise<OpportunitiesMapQueryResult<Auction>> {
    // For map view, limit to avoid performance issues
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: this.MAP_VIEW_LIMIT,
      offset: 0,
    };

    const [opportunities, total] = await Promise.all([
      this.auctionRepository.findAll(mapFilters),
      this.auctionRepository.count(filters),
    ]);

    return {
      opportunities,
      total,
      isLimited: total > this.MAP_VIEW_LIMIT,
    };
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
    const auctions = await this.auctionRepository.findAll(exportFilters);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(auctions);
    } 
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(auctions);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}