"use server";

import { resolve } from "~/server/di/di.container";
import type { OpportunityFilters } from "~/types/filters";
import type { AuctionListResult, AuctionMapResult } from "~/server/domains/auctions/services/auction.service";
import type { Auction } from "@linkinvests/shared";

export async function getAuctions(
  filters?: OpportunityFilters,
): Promise<AuctionListResult> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctions(filters);
}

export async function getAuctionsForMap(
  filters?: OpportunityFilters,
): Promise<AuctionMapResult> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionsForMap(filters);
}

export async function getAuctionById(id: string): Promise<Auction | null> {
  const auctionService = resolve('auctionService');
  return await auctionService.getAuctionById(id);
}