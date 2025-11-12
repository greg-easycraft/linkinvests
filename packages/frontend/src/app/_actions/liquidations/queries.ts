"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Liquidation } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

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

export async function exportLiquidations(
  filters: OpportunityFilters,
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