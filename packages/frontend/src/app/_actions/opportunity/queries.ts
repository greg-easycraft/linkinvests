"use server";

import { db } from "~/server/db";
import { DrizzleOpportunityRepository } from "~/server/domains/opportunities/repositories/DrizzleOpportunityRepository";
import { OpportunityService } from "~/server/domains/opportunities/services/OpportunityService";
import type { OpportunityFilters } from "~/server/domains/opportunities/types/filters";
import type { OpportunityListResult } from "~/server/domains/opportunities/services/OpportunityService";
import type { Opportunity } from "~/server/domains/opportunities/repositories/IOpportunityRepository";

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
): Promise<Opportunity[]> {
  return await opportunityService.getOpportunitiesForMap(filters);
}

export async function getOpportunityById(id: number): Promise<Opportunity | null> {
  return await opportunityService.getOpportunityById(id);
}
