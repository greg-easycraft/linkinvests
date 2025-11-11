import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";

export interface ILiquidationRepository {
  findAll(filters?: OpportunityFilters): Promise<Liquidation[]>;
  findById(id: string): Promise<Liquidation | null>;
  count(filters?: OpportunityFilters): Promise<number>;
}