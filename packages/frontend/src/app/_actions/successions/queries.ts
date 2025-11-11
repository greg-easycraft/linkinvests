"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { SuccessionListResult, SuccessionMapResult } from "~/server/domains/successions/services/succession.service";
import type { Succession } from "@linkinvests/shared";

export async function getSuccessions(
  filters?: OpportunityFilters,
): Promise<SuccessionListResult> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessions(filters);
}

export async function getSuccessionsForMap(
  filters?: OpportunityFilters,
): Promise<SuccessionMapResult> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionsForMap(filters);
}

export async function getSuccessionById(id: string): Promise<Succession | null> {
  const successionService = resolve('successionService');
  return await successionService.getSuccessionById(id);
}