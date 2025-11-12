"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { Auction } from "@linkinvests/shared";
import { OpportunitiesListQueryResult, OpportunitiesMapQueryResult } from "~/types/query-result";

export function getAuctions(
  filters?: OpportunityFilters,
): Promise<OpportunitiesListQueryResult<Auction>> {
  const auctionService = resolve('auctionService');
  return auctionService.getAuctions(filters);
}

export function getAuctionsForMap(
  filters?: OpportunityFilters,
): Promise<OpportunitiesMapQueryResult<Auction>> {
  const auctionService = resolve('auctionService');
  return auctionService.getAuctionsForMap(filters);
}

export function getAuctionById(id: string): Promise<Auction | null> {
  const auctionService = resolve('auctionService');
  return auctionService.getAuctionById(id);
}