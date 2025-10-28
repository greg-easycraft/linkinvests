import type { IOpportunityRepository, Opportunity } from "../repositories/IOpportunityRepository";
import type { OpportunityFilters } from "../types/filters";

export interface OpportunityListResult {
  opportunities: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class OpportunityService {
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

  async getOpportunitiesForMap(filters?: OpportunityFilters): Promise<Opportunity[]> {
    // For map view, we don't want pagination
    const mapFilters: OpportunityFilters = {
      ...filters,
      limit: undefined,
      offset: undefined,
    };

    return await this.repository.findAll(mapFilters);
  }
}
