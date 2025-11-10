"use server";

import { db } from "~/server/db";
import { DrizzleOpportunityRepository } from "~/server/domains/opportunities/repositories/opportunity-repository";
import { OpportunityService } from "~/server/domains/opportunities/services/opportunity-service";
import type { OpportunityFilters } from "~/types/filters";
import type { OpportunityListResult, OpportunityMapResult } from "~/server/domains/opportunities/services/opportunity-service";
import type { Opportunity } from "~/server/domains/opportunities/lib.types";
import { OpportunityType } from "@linkinvests/shared";

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

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  return await opportunityService.getOpportunityById(id);
}

// Type-specific queries for the new normalized schema
export async function getOpportunitiesByType(
  type: OpportunityType,
  filters?: OpportunityFilters,
): Promise<OpportunityListResult> {
  return await opportunityService.getOpportunitiesByType(type, filters);
}

export async function getOpportunitiesForMapByType(
  type: OpportunityType,
  filters?: OpportunityFilters,
): Promise<OpportunityMapResult> {
  return await opportunityService.getOpportunitiesForMapByType(type, filters);
}

export async function getOpportunityByIdAndType(
  id: string,
  type: OpportunityType,
): Promise<Opportunity | null> {
  return await opportunityService.getOpportunityByIdAndType(id, type);
}
