"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";

export async function getAuctions(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<Auction>> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctions(filters);
}

export async function getAuctionsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<Auction>> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionsForMap(filters);
}

export async function getAuctionById(id: string): Promise<Auction | null> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionById(id);
}

export async function exportAuctions(
  filters: OpportunityFilters,
  format: ExportFormat
): Promise<{ success: boolean; error?: string; blob?: Blob }> {
  try {
    const auctionService = resolve('auctionService');
    const blob = await auctionService.exportList(filters, format);
    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed"
    };
  }
}