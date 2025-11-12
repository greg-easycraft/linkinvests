import type { OpportunityFilters } from "~/types/filters";
import type { Listing } from "@linkinvests/shared";

export interface IListingRepository {
  findAll(filters?: OpportunityFilters): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}