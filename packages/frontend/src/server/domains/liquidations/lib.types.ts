import type { IOpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";

export interface ILiquidationRepository {
  findAll(filters?: IOpportunityFilters, paginationFilters?: PaginationFilters): Promise<Liquidation[]>;
  findById(id: string): Promise<Liquidation | null>;
  count(filters?: IOpportunityFilters): Promise<number>;
}