"use server";

import { resolve } from "~/server/di/di.container";
import type { IOpportunityFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getSuccessionsData(
  filters?: IOpportunityFilters,
): Promise<OpportunitiesDataQueryResult<Succession>> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionsData(filters);
}

export async function getSuccessionsCount(
  filters?: IOpportunityFilters,
): Promise<number> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionsCount(filters);
}


export async function getSuccessionById(id: string): Promise<Succession | null> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionById(id);
}

export async function exportSuccessions(
  filters: IOpportunityFilters,
  format: ExportFormat
): Promise<{ success: boolean; error?: string; blob?: Blob }> {
  try {
    const successionService = resolve('successionService');
    const blob = await successionService.exportList(filters, format);
    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}