import type { IAddressSearchRepository, DiagnosticLink, IAddressLinksRepository } from "../lib.types";
import { MAX_DIAGNOSTIC_LINKS } from "../lib.types";
import type { AddressSearchInput, AddressSearchResult, EnergyDiagnostic } from "@linkinvests/shared";
import { extractStreetFromAddress, extractCityFromAddress, calculateStreetMatchScore, calculateCityMatchScore } from "../utils/string-utils";

export type OpportunityType = 'auction' | 'listing';

export class AddressSearchService {
  private MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE = 10;

  constructor(
    private readonly energyDiagnosticsRepository: IAddressSearchRepository,
    private readonly addressLinksRepository: IAddressLinksRepository
  ) { }

  async getPlausibleAddresses(input: AddressSearchInput): Promise<AddressSearchResult[]> {
    const { energyClass, squareFootage, zipCode } = input;

    // Default to reasonable square footage range if not specified
    const minSquareFootage = squareFootage * (1 - (this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100));
    const maxSquareFootage = squareFootage * (1 + (this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100));
    const results = await this.energyDiagnosticsRepository.findAllForAddressSearch({
      zipCode,
      energyClass,
      squareFootageMin: minSquareFootage,
      squareFootageMax: maxSquareFootage,
    });

    if (!results.length) {
      return [];
    }

    const resultsWithMatchScore: AddressSearchResult[] = results.map((result) => ({
      ...result,
      matchScore: this.calculateMatchScore(result, input),
      energyDiagnosticId: result.externalId,
    })).sort((a, b) => b.matchScore - a.matchScore);

    return resultsWithMatchScore as AddressSearchResult[];
  }

  async searchAndLinkForOpportunity(
    input: AddressSearchInput,
    opportunityId: string,
    opportunityType: OpportunityType
  ): Promise<DiagnosticLink[]> {
    // Search for plausible addresses
    const searchResults = await this.getPlausibleAddresses(input);

    if (searchResults.length === 0) {
      return [];
    }

    // Take top N results
    const topResults = searchResults.slice(0, MAX_DIAGNOSTIC_LINKS);

    // Prepare links for saving
    const linksToSave = topResults.map(result => ({
      opportunityId,
      energyDiagnosticId: result.id,
      matchScore: Math.round(result.matchScore),
    }));

    // Save to appropriate junction table
    if (opportunityType === 'auction') {
      await this.addressLinksRepository.saveAuctionDiagnosticLinks(linksToSave);
      return this.addressLinksRepository.getAuctionDiagnosticLinks(opportunityId);
    }
    await this.addressLinksRepository.saveListingDiagnosticLinks(linksToSave);
    return this.addressLinksRepository.getListingDiagnosticLinks(opportunityId);
  }

  async getDiagnosticLinks(
    opportunityId: string,
    opportunityType: OpportunityType
  ): Promise<DiagnosticLink[]> {
    if (opportunityType === 'auction') {
      return this.addressLinksRepository.getAuctionDiagnosticLinks(opportunityId);
    }
    return this.addressLinksRepository.getListingDiagnosticLinks(opportunityId);
  }

  private calculateMatchScore(result: EnergyDiagnostic, input: AddressSearchInput): number {
    // Simple scoring algorithm - can be improved later
    let score = 100; // Base score

    // Reduce score based on square footage difference
    if (input.squareFootage && result.squareFootage) {
      const difference = Math.abs(result.squareFootage - input.squareFootage);
      const percentageDiff = difference / input.squareFootage;
      score -= percentageDiff * 20; // Up to 20 points penalty
    }

    // Extract street and city from addresses using zipCode
    const inputStreet = input.address ? extractStreetFromAddress(input.address, input.zipCode) : null;
    const resultStreet = result.address ? extractStreetFromAddress(result.address, result.zipCode) : null;
    const inputCity = input.address ? extractCityFromAddress(input.address, input.zipCode) : null;
    const resultCity = result.address ? extractCityFromAddress(result.address, result.zipCode) : null;

    // Street matching: up to 35 points penalty (high weight - most important)
    if (inputStreet && resultStreet) {
      const streetScore = calculateStreetMatchScore(inputStreet, resultStreet);
      score -= (100 - streetScore) * 0.35; // 0-35 point penalty
    }

    // City matching: up to 30 points penalty (medium weight)
    if (inputCity && resultCity) {
      const cityScore = calculateCityMatchScore(inputCity, resultCity);
      score -= (100 - cityScore) * 0.35; // 0-30 point penalty
    }

    return Math.max(0, score);
  }
}