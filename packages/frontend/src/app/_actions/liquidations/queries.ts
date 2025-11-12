"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

export async function getLiquidations(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<Liquidation>> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidations(filters);
}

export async function getLiquidationsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<Liquidation>> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationsForMap(filters);
}

export async function getLiquidationById(id: string): Promise<Liquidation | null> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationById(id);
}