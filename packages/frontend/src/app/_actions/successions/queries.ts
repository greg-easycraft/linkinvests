"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Succession } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getSuccessions(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<Succession>> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessions(filters);
}

export async function getSuccessionsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<Succession>> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionsForMap(filters);
}

export async function getSuccessionById(id: string): Promise<Succession | null> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionById(id);
}

export async function exportSuccessions(
  filters: OpportunityFilters,
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