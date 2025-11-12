import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

export class LiquidationService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly liquidationRepository: ILiquidationRepository) {}

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
}