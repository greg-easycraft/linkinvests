import { Injectable, Logger } from '@nestjs/common';
import {
  AddressSearchRepository,
  AddressLinksRepository,
  MAX_DIAGNOSTIC_LINKS,
  type DiagnosticLink,
} from '../lib.types';
import type {
  AddressSearchInput,
  AddressSearchResult,
  EnergyDiagnostic,
} from '@linkinvests/shared';
import {
  extractStreetFromAddress,
  extractCityFromAddress,
  calculateMatchScore,
} from '../utils/string-utils';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export type OpportunityType = 'auction' | 'listing';

export enum AddressSearchServiceErrorReason {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class AddressSearchService {
  private readonly logger = new Logger(AddressSearchService.name);
  private MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE = 10;

  constructor(
    private readonly energyDiagnosticsRepository: AddressSearchRepository,
    private readonly addressLinksRepository: AddressLinksRepository,
  ) {}

  async getPlausibleAddresses(
    input: AddressSearchInput,
  ): Promise<
    OperationResult<Array<AddressSearchResult>, AddressSearchServiceErrorReason>
  > {
    try {
      const { energyClass, squareFootage, zipCode } = input;

      // Default to reasonable square footage range if not specified
      const minSquareFootage =
        squareFootage *
        (1 - this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100);
      const maxSquareFootage =
        squareFootage *
        (1 + this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100);
      const results =
        await this.energyDiagnosticsRepository.findAllForAddressSearch({
          zipCode,
          energyClass,
          squareFootageMin: minSquareFootage,
          squareFootageMax: maxSquareFootage,
        });

      if (!results.length) {
        return succeed([]);
      }

      const resultsWithMatchScore: Array<AddressSearchResult> = results
        .map((result) => ({
          ...result,
          matchScore: this.calculateMatchScore(result, input),
          energyDiagnosticId: result.externalId,
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      return succeed(resultsWithMatchScore);
    } catch (error) {
      this.logger.error('Failed to get plausible addresses', error);
      return refuse(AddressSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async searchAndLinkForOpportunity(
    input: AddressSearchInput,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<
    OperationResult<Array<DiagnosticLink>, AddressSearchServiceErrorReason>
  > {
    try {
      // Search for plausible addresses
      const searchResult = await this.getPlausibleAddresses(input);

      if (!searchResult.success) {
        return refuse(searchResult.reason);
      }

      const searchResults = searchResult.data;

      if (searchResults.length === 0) {
        return succeed([]);
      }

      // Take top N results
      const topResults = searchResults.slice(0, MAX_DIAGNOSTIC_LINKS);

      // Prepare links for saving
      const linksToSave = topResults.map((result) => ({
        opportunityId,
        energyDiagnosticId: result.id,
        matchScore: Math.round(result.matchScore),
      }));

      // Save to appropriate junction table
      if (opportunityType === 'auction') {
        await this.addressLinksRepository.saveAuctionDiagnosticLinks(
          linksToSave,
        );
        const links =
          await this.addressLinksRepository.getAuctionDiagnosticLinks(
            opportunityId,
          );
        return succeed(links);
      }
      await this.addressLinksRepository.saveListingDiagnosticLinks(linksToSave);
      const links =
        await this.addressLinksRepository.getListingDiagnosticLinks(
          opportunityId,
        );
      return succeed(links);
    } catch (error) {
      this.logger.error('Failed to search and link for opportunity', error);
      return refuse(AddressSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getDiagnosticLinks(
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<
    OperationResult<Array<DiagnosticLink>, AddressSearchServiceErrorReason>
  > {
    try {
      if (opportunityType === 'auction') {
        const links =
          await this.addressLinksRepository.getAuctionDiagnosticLinks(
            opportunityId,
          );
        return succeed(links);
      }
      const links =
        await this.addressLinksRepository.getListingDiagnosticLinks(
          opportunityId,
        );
      return succeed(links);
    } catch (error) {
      this.logger.error('Failed to get diagnostic links', error);
      return refuse(AddressSearchServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  private calculateMatchScore(
    result: EnergyDiagnostic,
    input: AddressSearchInput,
  ): number {
    // Simple scoring algorithm - can be improved later
    let score = 100; // Base score

    // Reduce score based on square footage difference
    if (input.squareFootage && result.squareFootage) {
      const difference = Math.abs(result.squareFootage - input.squareFootage);
      const percentageDiff = difference / input.squareFootage;
      score -= percentageDiff * 30; // Up to 30 points penalty
    }

    // Use streetAddress and city fields directly
    const inputStreet = input.address
      ? extractStreetFromAddress(input.address, input.zipCode)
      : null;
    const resultStreet = result.streetAddress ?? null;
    const inputCity = input.address
      ? extractCityFromAddress(input.address, input.zipCode)
      : null;
    const resultCity = result.city;

    // City matching: up to 40 points penalty (highest weight)
    if (inputCity && resultCity) {
      const cityScore = calculateMatchScore(inputCity, resultCity);
      score -= cityScore * 40; // 0-40 point penalty
    }

    // Street matching: up to 30 points penalty (high weight)
    if (inputStreet && resultStreet) {
      const streetScore = calculateMatchScore(inputStreet, resultStreet);
      score -= streetScore * 30; // 0-30 point penalty
    }

    return Math.max(0, score);
  }
}
