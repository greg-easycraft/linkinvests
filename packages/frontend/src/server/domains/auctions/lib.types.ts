import type { IOpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";

export interface IAuctionRepository {
  findAll(filters?: IOpportunityFilters, paginationFilters?: PaginationFilters): Promise<Auction[]>;
  findById(id: string): Promise<Auction | null>;
  count(filters?: IOpportunityFilters): Promise<number>;
}