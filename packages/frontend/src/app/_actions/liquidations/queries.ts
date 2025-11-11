"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { LiquidationListResult, LiquidationMapResult } from "~/server/domains/liquidations/services/liquidation.service";
import type { Liquidation } from "@linkinvests/shared";

export async function getLiquidations(
  filters?: OpportunityFilters,
): Promise<LiquidationListResult> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidations(filters);
}

export async function getLiquidationsForMap(
  filters?: OpportunityFilters,
): Promise<LiquidationMapResult> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationsForMap(filters);
}

export async function getLiquidationById(id: string): Promise<Liquidation | null> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationById(id);
}