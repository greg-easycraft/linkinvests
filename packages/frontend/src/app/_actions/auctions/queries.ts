"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

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