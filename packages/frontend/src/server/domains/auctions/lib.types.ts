import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";

export interface IAuctionRepository {
  findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<Auction[]>;
  findById(id: string): Promise<Auction | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}