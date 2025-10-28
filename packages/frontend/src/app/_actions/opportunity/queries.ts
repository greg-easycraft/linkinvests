"use server";

import { db } from "~/server/db";
import { DrizzleOpportunityRepository } from "~/server/domains/opportunities/repositories/DrizzleOpportunityRepository";
import { OpportunityService } from "~/server/domains/opportunities/services/OpportunityService";
import type { OpportunityFilters } from "~/types/filters";
import type { OpportunityListResult, OpportunityMapResult } from "~/server/domains/opportunities/services/OpportunityService";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";

// Initialize repository and service
const opportunityRepository = new DrizzleOpportunityRepository(db);
const opportunityService = new OpportunityService(opportunityRepository);

export async function getOpportunities(
  filters?: OpportunityFilters,
): Promise<OpportunityListResult> {
  return await opportunityService.getOpportunities(filters);
}

export async function getOpportunitiesForMap(
  filters?: OpportunityFilters,
): Promise<OpportunityMapResult> {
  return await opportunityService.getOpportunitiesForMap(filters);
}

export async function getOpportunityById(id: number): Promise<Opportunity | null> {
  return await opportunityService.getOpportunityById(id);
}
