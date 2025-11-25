import type { IOpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Listing } from "@linkinvests/shared";

export interface IListingRepository {
  findAll(filters?: IOpportunityFilters, paginationFilters?: PaginationFilters): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  count(filters?: IOpportunityFilters): Promise<number>;
  getDistinctSources(): Promise<string[]>;
}