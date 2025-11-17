import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Listing } from "@linkinvests/shared";

export interface IListingRepository {
  findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}