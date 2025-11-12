"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Listing } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getListings(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<Listing>> {
  const listingService = resolve('listingService');
  return await listingService.getListings(filters);
}

export async function getListingsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<Listing>> {
  const listingService = resolve('listingService');
  return await listingService.getListingsForMap(filters);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listingService = resolve('listingService');
  return await listingService.getListingById(id);
}

export async function exportListings(
  filters: OpportunityFilters,
  format: ExportFormat
): Promise<{ success: boolean; error?: string; blob?: Blob }> {
  try {
    const listingService = resolve('listingService');
    const blob = await listingService.exportList(filters, format);
    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}