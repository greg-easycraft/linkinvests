"use server";

import { resolve } from "~/server/di/di.container";
import type { AddressSearchInput, AddressSearchResult } from "@linkinvests/shared";
import type { EnergyDiagnostic } from "@linkinvests/shared";

const addressSearchService = resolve('addressSearchService');
/**
 * Search for addresses based on energy diagnostic criteria
 * Returns ranked results with match confidence scores
 */
export async function searchAddressByEnergyDiagnostics(
  input: AddressSearchInput
): Promise<AddressSearchResult[]> {
  try {
    return await addressSearchService.getPlausibleAddresses(input);
  } catch (error) {
    console.error('Error searching addresses:', error);
    // Return empty array instead of throwing to allow graceful handling
    return [];
  }
}

/**
 * Get detailed information about a specific energy diagnostic
 */
export async function getEnergyDiagnosticDetails(id: string): Promise<EnergyDiagnostic | null> {
  try {
    const energyDiagnosticsService = resolve('energyDiagnosticsService');
    return await energyDiagnosticsService.getEnergyDiagnosticById(id);
  } catch (error) {
    console.error('Error fetching energy diagnostic details:', error);
    return null;
  }
}

/**
 * Get detailed information about a specific energy diagnostic by external id
 */
export async function getEnergyDiagnosticByExternalId(externalId: string): Promise<EnergyDiagnostic | null> {
  try {
    const energyDiagnosticsService = resolve('energyDiagnosticsService');
    return await energyDiagnosticsService.getEnergyDiagnosticByExternalId(externalId);
  } catch (error) {
    console.error('Error fetching energy diagnostic details:', error);
    return null;
  }
}