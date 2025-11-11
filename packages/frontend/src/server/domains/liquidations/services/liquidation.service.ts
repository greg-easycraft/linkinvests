import type { ILiquidationRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";

export interface LiquidationListResult {
  opportunities: Liquidation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LiquidationMapResult {
  opportunities: Liquidation[];
  total: number;
  isLimited: boolean;
}

export class LiquidationService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly liquidationRepository: ILiquidationRepository) {}

  async getLiquidations(filters?: OpportunityFilters): Promise<LiquidationListResult> {
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

  async getLiquidationsForMap(filters?: OpportunityFilters): Promise<LiquidationMapResult> {
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