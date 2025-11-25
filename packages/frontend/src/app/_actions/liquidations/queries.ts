"use server";

import { resolve } from "~/server/di/di.container";
import type { IOpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getLiquidationsData(
  filters?: IOpportunityFilters,
): Promise<OpportunitiesDataQueryResult<Liquidation>> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationsData(filters);
}

export async function getLiquidationsCount(
  filters?: IOpportunityFilters,
): Promise<number> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationsCount(filters);
}


export async function getLiquidationById(id: string): Promise<Liquidation | null> {
  const liquidationService = resolve('liquidationService');
  return await liquidationService.getLiquidationById(id);
}

export async function exportLiquidations(
  filters: IOpportunityFilters,
  format: ExportFormat
): Promise<{ success: boolean; error?: string; blob?: Blob }> {
  try {
    const liquidationService = resolve('liquidationService');
    const blob = await liquidationService.exportList(filters, format);
    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}