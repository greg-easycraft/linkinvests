"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { EnergyDiagnostic } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

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