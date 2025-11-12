import type { IAuctionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

export class AuctionService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly auctionRepository: IAuctionRepository) {}

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
}