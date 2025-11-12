"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getEnergyDiagnostics(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<EnergyDiagnostic>> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnostics(filters);
}

export async function getEnergyDiagnosticsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<EnergyDiagnostic>> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticsForMap(filters);
}

export async function getEnergyDiagnosticById(id: string): Promise<EnergyDiagnostic | null> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticById(id);
}

export async function exportEnergyDiagnostics(
  filters: OpportunityFilters,
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