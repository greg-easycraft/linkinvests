"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { EnergyDiagnosticsListResult, EnergyDiagnosticsMapResult } from "~/server/domains/energy-diagnostics/services/energy-diagnostics.service";
import type { EnergyDiagnostic } from "@linkinvests/shared";

export async function getEnergyDiagnostics(
  filters?: OpportunityFilters,
): Promise<EnergyDiagnosticsListResult> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnostics(filters);
}

export async function getEnergyDiagnosticsForMap(
  filters?: OpportunityFilters,
): Promise<EnergyDiagnosticsMapResult> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticsForMap(filters);
}

export async function getEnergyDiagnosticById(id: string): Promise<EnergyDiagnostic | null> {
  const energyDiagnosticsService = resolve('energyDiagnosticsService');
  return await energyDiagnosticsService.getEnergyDiagnosticById(id);
}