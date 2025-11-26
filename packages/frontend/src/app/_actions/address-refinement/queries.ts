"use server";

import { resolve } from "~/server/di/di.container";
import type { DiagnosticLink } from "~/server/domains/addresses/lib.types";
import type { OpportunityType } from "~/server/domains/addresses/services/address-search.service";
import type { EnergyClass } from "@linkinvests/shared";

const addressSearchService = resolve('addressSearchService');

export type { DiagnosticLink };

export interface SearchAndLinkInput {
  opportunityId: string;
  opportunityType: OpportunityType;
  zipCode: string;
  energyClass: EnergyClass;
  squareFootage?: number;
  address?: string;
}

/**
 * Get existing diagnostic links for an auction
 */
export async function getAuctionDiagnosticLinks(auctionId: string): Promise<DiagnosticLink[]> {
  try {
    return await addressSearchService.getDiagnosticLinks(auctionId, 'auction');
  } catch (error) {
    console.error('Error fetching auction diagnostic links:', error);
    return [];
  }
}

/**
 * Get existing diagnostic links for a listing
 */
export async function getListingDiagnosticLinks(listingId: string): Promise<DiagnosticLink[]> {
  try {
    return await addressSearchService.getDiagnosticLinks(listingId, 'listing');
  } catch (error) {
    console.error('Error fetching listing diagnostic links:', error);
    return [];
  }
}

/**
 * Search and link energy diagnostics for an opportunity
 * Saves top 5 best-scored results to the database
 */
export async function searchAndLinkDiagnostics(input: SearchAndLinkInput): Promise<DiagnosticLink[]> {
  try {
    return await addressSearchService.searchAndLinkForOpportunity(
      {
        zipCode: input.zipCode,
        energyClass: input.energyClass,
        squareFootage: input.squareFootage ?? 50,
        address: input.address,
      },
      input.opportunityId,
      input.opportunityType
    );
  } catch (error) {
    console.error('Error searching and linking diagnostics:', error);
    return [];
  }
}
