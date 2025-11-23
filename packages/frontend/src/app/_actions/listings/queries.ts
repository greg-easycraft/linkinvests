"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Listing } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getListingsData(
  filters?: OpportunityFilters,
): Promise<OpportunitiesDataQueryResult<Listing>> {
  const listingService = resolve('listingService');
  return await listingService.getListingsData(filters);
}

export async function getListingsCount(
  filters?: OpportunityFilters,
): Promise<number> {
  const listingService = resolve('listingService');
  return await listingService.getListingsCount(filters);
}


export async function getListingById(id: string): Promise<Listing | null> {
  const listingService = resolve('listingService');
  return await listingService.getListingById(id);
}

export async function getAvailableSources(): Promise<string[]> {
  const listingService = resolve('listingService');
  return await listingService.getAvailableSources();
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