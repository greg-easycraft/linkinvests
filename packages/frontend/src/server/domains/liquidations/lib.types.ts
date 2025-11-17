import type { OpportunityFilters, PaginationFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";

export interface ILiquidationRepository {
  findAll(filters?: OpportunityFilters, paginationFilters?: PaginationFilters): Promise<Liquidation[]>;
  findById(id: string): Promise<Liquidation | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}