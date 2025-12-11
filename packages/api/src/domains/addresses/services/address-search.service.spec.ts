import { AddressSearchService } from './address-search.service';
import type {
  AddressLinksRepository,
  AddressSearchRepository,
} from '../lib.types';
import type { AddressSearchInput, EnergyDiagnostic } from '@linkinvests/shared';
import { EnergyClass } from '@linkinvests/shared';

describe('AddressSearchService', () => {
  let addressSearchService: AddressSearchService;
  const mockAddressSearchRepository = {
    findAllForAddressSearch: jest.fn(),
    findById: jest.fn(),
  } as jest.Mocked<AddressSearchRepository>;
  const mockAddressLinksRepository = {
    saveAuctionDiagnosticLinks: jest.fn(),
    saveListingDiagnosticLinks: jest.fn(),
    getAuctionDiagnosticLinks: jest.fn(),
    getListingDiagnosticLinks: jest.fn(),
  } as jest.Mocked<AddressLinksRepository>;

  const mockEnergyDiagnostic: EnergyDiagnostic = {
    id: 'energy-diagnostic-1',
    label: 'Test Energy Diagnostic',
    address: '123 Test Street',
    zipCode: '75001',
    department: '75',
    latitude: 48.8566,
    longitude: 2.3522,
    opportunityDate: '2024-01-15',
    squareFootage: 50,
    energyClass: 'F',
    gazClass: 'F',
    externalId: 'external-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Initialize service with mocked dependencies
    addressSearchService = new AddressSearchService(
      mockAddressSearchRepository,
      mockAddressLinksRepository,
    );
  });

  describe('getPlausibleAddresses', () => {
    it('should return empty array when no results found', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
      const call =
        mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0][0];
      expect(call.zipCode).toBe('75001');
      expect(call.energyClass).toBe('F');
      expect(call.squareFootageMin).toBeCloseTo(45, 1); // 50 * 0.9
      expect(call.squareFootageMax).toBeCloseTo(55, 1); // 50 * 1.1
    });

    it('should return results with match scores when data found', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const mockResults = [mockEnergyDiagnostic];
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue(
        mockResults,
      );

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
          ...mockEnergyDiagnostic,
          matchScore: 100, // Perfect match
          energyDiagnosticId: 'external-123',
        });
      }
    });

    it('should handle undefined square footage by computing NaN ranges', async () => {
      // @ts-expect-error - Testing optional property behavior
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        // squareFootage not provided
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      const call =
        mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0]?.[0];
      expect(call?.zipCode).toBe('75001');
      expect(call?.energyClass).toBe('F');
      // When squareFootage is undefined, the calculation results in NaN
      expect(call?.squareFootageMin).toBeNaN();
      expect(call?.squareFootageMax).toBeNaN();
    });

    it('should pass undefined energy class when not provided', async () => {
      // @ts-expect-error - Testing optional property behavior
      const input: AddressSearchInput = {
        zipCode: '75001',
        squareFootage: 60,
        // energyClass not provided
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      expect(
        mockAddressSearchRepository.findAllForAddressSearch,
      ).toHaveBeenCalledWith({
        zipCode: '75001',
        energyClass: undefined, // No default, passes through as undefined
        squareFootageMin: 54, // 60 * 0.9
        squareFootageMax: 66, // 60 * 1.1
      });
    });

    it('should calculate correct square footage range with 10% tolerance', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.G,
        squareFootage: 100,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      const call =
        mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0]?.[0];
      expect(call?.zipCode).toBe('75001');
      expect(call?.energyClass).toBe('G');
      expect(call?.squareFootageMin).toBeCloseTo(90, 1); // 100 * 0.9
      expect(call?.squareFootageMax).toBeCloseTo(110, 1); // 100 * 1.1
    });

    it('should sort results by match score in descending order', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const energyDiagnostic1 = {
        ...mockEnergyDiagnostic,
        id: 'diag-1',
        energyClass: 'F',
        squareFootage: 50,
      }; // Perfect match - score 100
      const energyDiagnostic2 = {
        ...mockEnergyDiagnostic,
        id: 'diag-2',
        energyClass: 'G',
        squareFootage: 50,
      }; // Energy class mismatch but no penalty in scoring - score 100
      const energyDiagnostic3 = {
        ...mockEnergyDiagnostic,
        id: 'diag-3',
        energyClass: 'F',
        squareFootage: 60,
      }; // Size difference 20% - score ~94 (100 - 0.2 * 30)

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        energyDiagnostic2,
        energyDiagnostic3,
        energyDiagnostic1,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
        // diag-1 and diag-2 both have score 100, diag-3 has lower score
        // Order between equal scores depends on original array order
        expect(result.data[0]?.matchScore).toBe(100);
        expect(result.data[1]?.matchScore).toBe(100);
        expect(result.data[2]?.id).toBe('diag-3'); // Lowest score due to size difference
        expect(result.data[2]?.matchScore).toBeCloseTo(94, 0); // 100 - (0.2 * 30)
      }
    });

    it('should handle repository errors and return refusal', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const error = new Error('Repository error');
      mockAddressSearchRepository.findAllForAddressSearch.mockRejectedValue(
        error,
      );

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe('UNKNOWN_ERROR');
      }
    });

    it('should include energyDiagnosticId from externalId', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const diagnosticWithExternalId = {
        ...mockEnergyDiagnostic,
        externalId: 'external-abc-123',
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        diagnosticWithExternalId,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]?.energyDiagnosticId).toBe('external-abc-123');
      }
    });
  });

  describe('calculateMatchScore (private method testing through public interface)', () => {
    it('should give perfect score for exact matches', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const perfectMatch = {
        ...mockEnergyDiagnostic,
        energyClass: 'F',
        squareFootage: 50,
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        perfectMatch,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]?.matchScore).toBe(100);
      }
    });

    it('should not reduce score for energy class mismatch (scoring only considers square footage)', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const energyMismatch = {
        ...mockEnergyDiagnostic,
        energyClass: 'G',
        squareFootage: 50,
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        energyMismatch,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Energy class mismatch does not affect score - only square footage does
        expect(result.data[0]?.matchScore).toBe(100);
      }
    });

    it('should reduce score based on square footage difference', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 100,
      };

      const sizeMismatch = {
        ...mockEnergyDiagnostic,
        energyClass: 'F',
        squareFootage: 120,
      }; // 20% difference
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        sizeMismatch,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Score = 100 - (0.2 * 30) = 94 (30 is the penalty multiplier for square footage)
        expect(result.data[0]?.matchScore).toBe(94);
      }
    });

    it('should handle cases where square footage is missing', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      const noSquareFootage = {
        ...mockEnergyDiagnostic,
        energyClass: 'F',
        squareFootage: undefined as any,
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        noSquareFootage,
      ] as any);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]?.matchScore).toBe(100); // No penalty if squareFootage is missing
      }
    });

    it('should ensure minimum score is 0', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 10,
      };

      // Very large size difference that would result in negative score
      const hugeSizeMismatch = {
        ...mockEnergyDiagnostic,
        energyClass: 'G',
        squareFootage: 1000,
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        hugeSizeMismatch,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]?.matchScore).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('searchAndLinkForOpportunity', () => {
    const mockDiagnosticLink = {
      id: 'link-1',
      energyDiagnosticId: 'energy-diagnostic-1',
      matchScore: 95,
      energyDiagnostic: {
        id: 'energy-diagnostic-1',
        address: '123 Test Street',
        zipCode: '75001',
        energyClass: 'F',
        squareFootage: 50,
        opportunityDate: '2024-01-15',
        externalId: 'external-123',
      },
    };

    it('should return empty array when no search results found', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      const result = await addressSearchService.searchAndLinkForOpportunity(
        input,
        'opportunity-123',
        'auction',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
      expect(
        mockAddressLinksRepository.saveAuctionDiagnosticLinks,
      ).not.toHaveBeenCalled();
    });

    it('should save and return auction diagnostic links', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        mockEnergyDiagnostic,
      ]);
      mockAddressLinksRepository.getAuctionDiagnosticLinks.mockResolvedValue([
        mockDiagnosticLink,
      ]);

      const result = await addressSearchService.searchAndLinkForOpportunity(
        input,
        'opportunity-123',
        'auction',
      );

      expect(
        mockAddressLinksRepository.saveAuctionDiagnosticLinks,
      ).toHaveBeenCalledWith([
        {
          opportunityId: 'opportunity-123',
          energyDiagnosticId: 'energy-diagnostic-1',
          matchScore: 100,
        },
      ]);
      expect(
        mockAddressLinksRepository.getAuctionDiagnosticLinks,
      ).toHaveBeenCalledWith('opportunity-123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([mockDiagnosticLink]);
      }
    });

    it('should save and return listing diagnostic links', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        mockEnergyDiagnostic,
      ]);
      mockAddressLinksRepository.getListingDiagnosticLinks.mockResolvedValue([
        mockDiagnosticLink,
      ]);

      const result = await addressSearchService.searchAndLinkForOpportunity(
        input,
        'listing-123',
        'listing',
      );

      expect(
        mockAddressLinksRepository.saveListingDiagnosticLinks,
      ).toHaveBeenCalledWith([
        {
          opportunityId: 'listing-123',
          energyDiagnosticId: 'energy-diagnostic-1',
          matchScore: 100,
        },
      ]);
      expect(
        mockAddressLinksRepository.getListingDiagnosticLinks,
      ).toHaveBeenCalledWith('listing-123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([mockDiagnosticLink]);
      }
    });

    it('should limit results to MAX_DIAGNOSTIC_LINKS', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
      };

      // Create 10 mock results
      const manyResults = Array.from({ length: 10 }, (_, i) => ({
        ...mockEnergyDiagnostic,
        id: `diag-${i}`,
        externalId: `external-${i}`,
      }));

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue(
        manyResults,
      );
      mockAddressLinksRepository.getAuctionDiagnosticLinks.mockResolvedValue(
        [],
      );

      await addressSearchService.searchAndLinkForOpportunity(
        input,
        'opportunity-123',
        'auction',
      );

      // Should only save 5 links (MAX_DIAGNOSTIC_LINKS)
      const savedLinks =
        mockAddressLinksRepository.saveAuctionDiagnosticLinks.mock.calls[0][0];
      expect(savedLinks).toHaveLength(5);
    });

    it('should round match scores when saving links', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 100,
      };

      const resultWithDecimalScore = {
        ...mockEnergyDiagnostic,
        squareFootage: 95, // 5% difference -> score = 100 - (0.05 * 30) = 98.5
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        resultWithDecimalScore,
      ]);
      mockAddressLinksRepository.getAuctionDiagnosticLinks.mockResolvedValue(
        [],
      );

      await addressSearchService.searchAndLinkForOpportunity(
        input,
        'opportunity-123',
        'auction',
      );

      const savedLinks =
        mockAddressLinksRepository.saveAuctionDiagnosticLinks.mock.calls[0][0];
      expect(savedLinks[0].matchScore).toBe(99); // Rounded from 98.5
    });
  });

  describe('getDiagnosticLinks', () => {
    const mockDiagnosticLinks = [
      {
        id: 'link-1',
        energyDiagnosticId: 'energy-diagnostic-1',
        matchScore: 95,
        energyDiagnostic: {
          id: 'energy-diagnostic-1',
          address: '123 Test Street',
          zipCode: '75001',
          energyClass: 'F',
          squareFootage: 50,
          opportunityDate: '2024-01-15',
          externalId: 'external-123',
        },
      },
    ];

    it('should return auction diagnostic links', async () => {
      mockAddressLinksRepository.getAuctionDiagnosticLinks.mockResolvedValue(
        mockDiagnosticLinks,
      );

      const result = await addressSearchService.getDiagnosticLinks(
        'auction-123',
        'auction',
      );

      expect(
        mockAddressLinksRepository.getAuctionDiagnosticLinks,
      ).toHaveBeenCalledWith('auction-123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockDiagnosticLinks);
      }
    });

    it('should return listing diagnostic links', async () => {
      mockAddressLinksRepository.getListingDiagnosticLinks.mockResolvedValue(
        mockDiagnosticLinks,
      );

      const result = await addressSearchService.getDiagnosticLinks(
        'listing-123',
        'listing',
      );

      expect(
        mockAddressLinksRepository.getListingDiagnosticLinks,
      ).toHaveBeenCalledWith('listing-123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockDiagnosticLinks);
      }
    });

    it('should return empty array when no links exist', async () => {
      mockAddressLinksRepository.getAuctionDiagnosticLinks.mockResolvedValue(
        [],
      );

      const result = await addressSearchService.getDiagnosticLinks(
        'auction-456',
        'auction',
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('calculateMatchScore with address matching', () => {
    it('should reduce score based on city mismatch', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
        address: '123 Rue de Rivoli 75001 Paris',
      };

      const resultWithDifferentCity = {
        ...mockEnergyDiagnostic,
        address: '456 Rue de Lyon 75001 Lyon',
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        resultWithDifferentCity,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Score should be reduced due to city mismatch
        expect(result.data[0]?.matchScore).toBeLessThan(100);
      }
    });

    it('should reduce score based on street mismatch', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
        address: '123 Rue de Rivoli 75001 Paris',
      };

      const resultWithDifferentStreet = {
        ...mockEnergyDiagnostic,
        address: '456 Avenue des Champs 75001 Paris',
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        resultWithDifferentStreet,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Score should be reduced due to street mismatch
        expect(result.data[0]?.matchScore).toBeLessThan(100);
      }
    });

    it('should not penalize when addresses are similar', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
        address: '123 Rue de Rivoli 75001 Paris',
      };

      const resultWithSameAddress = {
        ...mockEnergyDiagnostic,
        address: '123 Rue de Rivoli 75001 Paris',
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        resultWithSameAddress,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Score should be high for matching addresses
        expect(result.data[0]?.matchScore).toBe(100);
      }
    });

    it('should handle input without address', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
        // no address field
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        mockEnergyDiagnostic,
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should not fail, score based only on square footage
        expect(result.data[0]?.matchScore).toBe(100);
      }
    });

    it('should handle result without address', async () => {
      const input = {
        zipCode: '75001',
        energyClass: EnergyClass.F,
        squareFootage: 50,
        address: '123 Rue de Rivoli 75001 Paris',
      };

      const resultWithoutAddress = {
        ...mockEnergyDiagnostic,
        address: undefined as any,
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        resultWithoutAddress,
      ] as any);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should not fail, skip address matching
        expect(result.data[0]?.matchScore).toBe(100);
      }
    });
  });
});
