"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesDataQueryResult } from "~/types/query-result";
import type { ExportFormat } from "~/server/services/export.service";



export async function getAuctionsData(
  filters?: OpportunityFilters,
): Promise<OpportunitiesDataQueryResult<Auction>> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionsData(filters);
}

export async function getAuctionsCount(
  filters?: OpportunityFilters,
): Promise<number> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionsCount(filters);
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