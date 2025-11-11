import type { ISuccessionRepository } from "../lib.types";
import type { OpportunityFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";

export interface SuccessionListResult {
  opportunities: Succession[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuccessionMapResult {
  opportunities: Succession[];
  total: number;
  isLimited: boolean;
}

export class SuccessionService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly successionRepository: ISuccessionRepository) {}

  async getSuccessions(filters?: OpportunityFilters): Promise<SuccessionListResult> {
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

  async getSuccessionsForMap(filters?: OpportunityFilters): Promise<SuccessionMapResult> {
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
}