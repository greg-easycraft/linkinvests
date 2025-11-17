import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";

export interface ISuccessionRepository {
  findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<Succession[]>;
  findById(id: string): Promise<Succession | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}