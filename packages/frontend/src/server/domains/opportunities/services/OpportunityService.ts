import type { IOpportunityRepository, Opportunity } from "../repositories/IOpportunityRepository";
import type { OpportunityFilters } from "../types/filters";

export interface OpportunityListResult {
  opportunities: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OpportunityMapResult {
  opportunities: Opportunity[];
  total: number;
  isLimited: boolean;
}

export class OpportunityService {
  private readonly MAP_VIEW_LIMIT = 500;

  constructor(private readonly repository: IOpportunityRepository) {}

  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityListResult> {
    const pageSize = filters?.limit ?? 25;
    const page = filters?.offset ? Math.floor(filters.offset / pageSize) + 1 : 1;

    const [opportunities, total] = await Promise.all([
      this.repository.findAll(filters),
      this.repository.count(filters),
    ]);

    return {
      opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOpportunityById(id: number): Promise<Opportunity | null> {
    return await this.repository.findById(id);
  }

  async getOpportunitiesForMap(filters?: OpportunityFilters): Promise<OpportunityMapResult> {
    // For map view, limit to avoid performance issues
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: this.MAP_VIEW_LIMIT,
      offset: 0,
    };

    const [opportunities, total] = await Promise.all([
      this.repository.findAll(mapFilters),
      this.repository.count(filters),
    ]);

    return {
      opportunities,
      total,
      isLimited: total > this.MAP_VIEW_LIMIT,
    };
  }
}
