/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddressSearchService } from './address-search.service';
import type { IAddressSearchRepository } from '../lib.types';
import type { AddressSearchInput, EnergyDiagnostic } from '@linkinvests/shared';
import { OpportunityType } from '@linkinvests/shared';

describe('AddressSearchService', () => {
  let addressSearchService: AddressSearchService;
  let mockAddressSearchRepository: jest.Mocked<IAddressSearchRepository>;

  const mockEnergyDiagnostic: EnergyDiagnostic = {
    id: 'energy-diagnostic-1',
    // @ts-expect-error - type property doesn't exist on EnergyDiagnostic but needed for test
    type: OpportunityType.ENERGY_SIEVE,
    title: 'Test Energy Diagnostic',
    description: 'Test Description',
    address: '123 Test Street',
    zipCode: '75001',
    city: 'Paris',
    department: '75',
    price: 150000,
    surface: 50,
    squareFootage: 50,
    rooms: 2,
    energyClass: 'F',
    externalId: 'external-123',
    diagnosticDate: new Date('2024-01-15'),
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked repository
    mockAddressSearchRepository = {
      findAllForAddressSearch: jest.fn(),
      findById: jest.fn(),
    };

    // Initialize service with mocked dependency
    addressSearchService = new AddressSearchService(mockAddressSearchRepository);
  });

  describe('getPlausibleAddresses', () => {
    it('should return empty array when no results found', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result).toEqual([]);
      // @ts-expect-error - Test mock calls are guaranteed to exist in test context
      const call = mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0][0];
      expect(call.zipCode).toBe('75001');
      expect(call.energyClass).toBe('F');
      expect(call.squareFootageMin).toBeCloseTo(45, 1); // 50 * 0.9
      expect(call.squareFootageMax).toBeCloseTo(55, 1); // 50 * 1.1
    });

    it('should return results with match scores when data found', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const mockResults = [mockEnergyDiagnostic];
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue(mockResults);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockEnergyDiagnostic,
        matchScore: 100, // Perfect match
        energyDiagnosticId: 'external-123',
      });
    });

    it('should use default square footage when not provided', async () => {
      // @ts-expect-error - Testing optional property behavior
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        // squareFootage not provided
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      const call = mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0]?.[0];
      expect(call?.zipCode).toBe('75001');
      expect(call?.energyClass).toBe('F');
      expect(call?.squareFootageMin).toBeCloseTo(45, 1); // 50 * 0.9 (default 50)
      expect(call?.squareFootageMax).toBeCloseTo(55, 1); // 50 * 1.1
    });

    it('should use default energy class when not provided', async () => {
      // @ts-expect-error - Testing optional property behavior
      const input: AddressSearchInput = {
        zipCode: '75001',
        squareFootage: 60,
        // dpe not provided
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      expect(mockAddressSearchRepository.findAllForAddressSearch).toHaveBeenCalledWith({
        zipCode: '75001',
        energyClass: 'F', // Default
        squareFootageMin: 54, // 60 * 0.9
        squareFootageMax: 66, // 60 * 1.1
      });
    });

    it('should calculate correct square footage range with 10% tolerance', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'G',
        squareFootage: 100,
      };

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([]);

      await addressSearchService.getPlausibleAddresses(input);

      const call = mockAddressSearchRepository.findAllForAddressSearch.mock.calls[0]?.[0];
      expect(call?.zipCode).toBe('75001');
      expect(call?.energyClass).toBe('G');
      expect(call?.squareFootageMin).toBeCloseTo(90, 1); // 100 * 0.9
      expect(call?.squareFootageMax).toBeCloseTo(110, 1); // 100 * 1.1
    });

    it('should sort results by match score in descending order', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const energyDiagnostic1 = { ...mockEnergyDiagnostic, id: 'diag-1', energyClass: 'F', squareFootage: 50 }; // Perfect match - score 100
      const energyDiagnostic2 = { ...mockEnergyDiagnostic, id: 'diag-2', energyClass: 'G', squareFootage: 50 }; // Energy class mismatch - score 90
      const energyDiagnostic3 = { ...mockEnergyDiagnostic, id: 'diag-3', energyClass: 'F', squareFootage: 60 }; // Size difference - score ~96

      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([
        energyDiagnostic2, energyDiagnostic3, energyDiagnostic1
      ]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('diag-1'); // Highest score first
      expect(result[0]?.matchScore).toBe(100);
      expect(result[1]?.id).toBe('diag-3'); // Second highest
      expect(result[1]?.matchScore).toBeCloseTo(96, 0);
      expect(result[2]?.id).toBe('diag-2'); // Lowest score
      expect(result[2]?.matchScore).toBe(90);
    });

    it('should handle repository errors', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const error = new Error('Repository error');
      mockAddressSearchRepository.findAllForAddressSearch.mockRejectedValue(error);

      await expect(addressSearchService.getPlausibleAddresses(input)).rejects.toThrow('Repository error');
    });

    it('should include energyDiagnosticId from externalId', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const diagnosticWithExternalId = {
        ...mockEnergyDiagnostic,
        externalId: 'external-abc-123'
      };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([diagnosticWithExternalId]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.energyDiagnosticId).toBe('external-abc-123');
    });
  });

  describe('calculateMatchScore (private method testing through public interface)', () => {
    it('should give perfect score for exact matches', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const perfectMatch = { ...mockEnergyDiagnostic, energyClass: 'F', squareFootage: 50 };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([perfectMatch]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.matchScore).toBe(100);
    });

    it('should reduce score for energy class mismatch', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const energyMismatch = { ...mockEnergyDiagnostic, energyClass: 'G', squareFootage: 50 };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([energyMismatch]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.matchScore).toBe(90); // 100 - 10 penalty
    });

    it('should reduce score based on square footage difference', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 100,
      };

      const sizeMismatch = { ...mockEnergyDiagnostic, energyClass: 'F', squareFootage: 120 }; // 20% difference
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([sizeMismatch]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.matchScore).toBe(96); // 100 - (0.2 * 20) penalty
    });

    it('should handle cases where square footage is missing', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 50,
      };

      const noSquareFootage = { ...mockEnergyDiagnostic, energyClass: 'F', squareFootage: undefined as any };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([noSquareFootage] as any);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.matchScore).toBe(100); // No penalty if squareFootage is missing
    });

    it('should ensure minimum score is 0', async () => {
      const input: AddressSearchInput = {
        zipCode: '75001',
        dpe: 'F',
        squareFootage: 10,
      };

      // Very large size difference that would result in negative score
      const hugeSizeMismatch = { ...mockEnergyDiagnostic, energyClass: 'G', squareFootage: 1000 };
      mockAddressSearchRepository.findAllForAddressSearch.mockResolvedValue([hugeSizeMismatch]);

      const result = await addressSearchService.getPlausibleAddresses(input);

      expect(result[0]?.matchScore).toBeGreaterThanOrEqual(0);
    });
  });
});