import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";

export interface IAuctionRepository {
  findAll(filters?: OpportunityFilters): Promise<Auction[]>;
  findById(id: string): Promise<Auction | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}