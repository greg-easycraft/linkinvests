import type { IAddressSearchRepository } from "../lib.types";
import type { AddressSearchInput, AddressSearchResult, EnergyDiagnostic} from "@linkinvests/shared";

export class AddressSearchService {
  private MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE = 10;

  constructor(
    private readonly energyDiagnosticsRepository: IAddressSearchRepository
  ) {}

  async getPlausibleAddresses(input: AddressSearchInput): Promise<AddressSearchResult[]> {
    const { energyClass, squareFootage, zipCode } = input;

    // Default to reasonable square footage range if not specified
    const baseSquareFootage = squareFootage || 50;
    const minSquareFootage = baseSquareFootage * (1 - (this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100));
    const maxSquareFootage = baseSquareFootage * (1 + (this.MAX_SQUARE_FOOTAGE_DIFFERENCE_PERCENTAGE / 100));
    const results = await this.energyDiagnosticsRepository.findAllForAddressSearch({
      zipCode,
      energyClass,
      squareFootageMin: minSquareFootage,
      squareFootageMax: maxSquareFootage,
    });

    if(!results.length) {
      return [];
    }

    const resultsWithMatchScore: AddressSearchResult[] = results.map((result) => ({
      ...result,
      matchScore: this.calculateMatchScore(result, input),
      energyDiagnosticId: result.externalId,
    })).sort((a, b) => b.matchScore - a.matchScore);

    return resultsWithMatchScore as AddressSearchResult[];
  }

  private calculateMatchScore(result: EnergyDiagnostic, input: AddressSearchInput): number {
    // Simple scoring algorithm - can be improved later
    let score = 100; // Base score

    // Reduce score if energy class doesn't match exactly
    if (input.energyClass && result.energyClass !== input.energyClass) {
      score -= 10;
    }

    // Reduce score based on square footage difference
    if (input.squareFootage && result.squareFootage) {
      const difference = Math.abs(result.squareFootage - input.squareFootage);
      const percentageDiff = difference / input.squareFootage;
      score -= percentageDiff * 20; // Up to 20 points penalty
    }

    return Math.max(0, score);
  }
}