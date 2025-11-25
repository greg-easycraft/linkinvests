"use server";

import { resolve } from "~/server/di/di.container";
import type { IOpportunityFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getEnergyDiagnosticsData(
  filters?: IOpportunityFilters,
): Promise<OpportunitiesDataQueryResult<EnergyDiagnostic>> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticsData(filters);
}

export async function getEnergyDiagnosticsCount(
  filters?: IOpportunityFilters,
): Promise<number> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticsCount(filters);
}


export async function getEnergyDiagnosticById(id: string): Promise<EnergyDiagnostic | null> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticById(id);
}

export async function exportEnergyDiagnostics(
  filters: IOpportunityFilters,
  format: ExportFormat
): Promise<{ success: boolean; error?: string; blob?: Blob }> {
  try {
    const energyDiagnosticsService = resolve('energyDiagnosticsService');
    const blob = await energyDiagnosticsService.exportList(filters, format);
    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}