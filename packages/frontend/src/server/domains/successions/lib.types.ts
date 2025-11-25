import type { IOpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";

export interface ISuccessionRepository {
  findAll(filters?: IOpportunityFilters, paginationFilters?: PaginationFilters): Promise<Succession[]>;
  findById(id: string): Promise<Succession | null>;
  count(filters?: IOpportunityFilters): Promise<number>;
}