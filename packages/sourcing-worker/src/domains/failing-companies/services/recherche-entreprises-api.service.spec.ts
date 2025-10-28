import { Test, TestingModule } from '@nestjs/testing';
import { RechercheEntreprisesApiService } from './recherche-entreprises-api.service';
import type {
  RechercheEntreprisesResponse,
  Etablissement,
} from '../types/recherche-entreprises.types';

// Mock global fetch
global.fetch = jest.fn();

describe('RechercheEntreprisesApiService', () => {
  let service: RechercheEntreprisesApiService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  const mockEtablissement: Etablissement = {
    siret: '12345678901234',
    adresse: '123 Rue de Test',
    code_postal: '75001',
    commune: 'Test Company',
    libelle_commune: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RechercheEntreprisesApiService],
    }).compile();

    service = module.get<RechercheEntreprisesApiService>(
      RechercheEntreprisesApiService,
    );

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    // Mock Date.now() for rate limiting tests
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getEstablishmentsBySiren', () => {
    it('should successfully fetch establishments for valid SIREN', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const mockResponse: RechercheEntreprisesResponse = {
        results: [
          {
            siren: '123456789',
            siege: mockEtablissement,
            matching_etablissements: [
              {
                ...mockEtablissement,
                siret: '12345678909876',
                adresse: '456 Avenue Test',
              },
            ],
            nom_complet: 'Test Company',
            nom_raison_sociale: 'Test Company',
            nombre_etablissements: 2,
          },
        ],
        total_results: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getEstablishmentsBySiren('123456789');

      expect(result).toHaveLength(2);
      expect(result[0]?.siret).toBe('12345678901234'); // siege
      expect(result[1]?.siret).toBe('12345678909876'); // matching establishment
      expect(mockFetch).toHaveBeenCalledWith(
        'https://recherche-entreprises.api.gouv.fr/search?q=123456789',
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal),
        }),
      );

      sleepSpy.mockRestore();
    });

    it('should return only siege when no matching establishments', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const mockResponse: RechercheEntreprisesResponse = {
        results: [
          {
            siren: '123456789',
            siege: mockEtablissement,
            matching_etablissements: [],
            nom_complet: 'Test Company',
            nom_raison_sociale: 'Test Company',
            nombre_etablissements: 1,
          },
        ],
        total_results: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getEstablishmentsBySiren('123456789');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockEtablissement);

      sleepSpy.mockRestore();
    });

    it('should return empty array for invalid SIREN format (not 9 digits)', async () => {
      const result = await service.getEstablishmentsBySiren('12345');

      expect(result).toEqual([]);
      expect(service['logger'].warn).toHaveBeenCalledWith(
        'Invalid SIREN format: 12345',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return empty array for SIREN with non-numeric characters', async () => {
      const result = await service.getEstablishmentsBySiren('12345678A');

      expect(result).toEqual([]);
      expect(service['logger'].warn).toHaveBeenCalledWith(
        'Invalid SIREN format: 12345678A',
      );
    });

    it('should return empty array when no results found', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const mockResponse: RechercheEntreprisesResponse = {
        results: [],
        total_results: 0,
        page: 1,
        per_page: 10,
        total_pages: 0,
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getEstablishmentsBySiren('999999999');

      expect(result).toEqual([]);
      expect(service['logger'].warn).toHaveBeenCalledWith(
        'No results found for SIREN: 999999999',
      );

      sleepSpy.mockRestore();
    });

    it('should return empty array when results is undefined', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await service.getEstablishmentsBySiren('123456789');

      expect(result).toEqual([]);

      sleepSpy.mockRestore();
    });

    it('should return empty array on API error', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.getEstablishmentsBySiren('123456789');

      expect(result).toEqual([]);
      expect(service['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch establishments'),
        expect.any(String),
      );

      sleepSpy.mockRestore();
    });

    it('should handle result with neither siege nor matching establishments', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const mockResponse = {
        results: [
          {
            siren: '123456789',
            siege: undefined,
            matching_etablissements: undefined,
            nom_complet: 'Test Company',
            nom_raison_sociale: 'Test Company',
            nombre_etablissements: 0,
          },
        ],
        total_results: 1,
        page: 1,
        per_page: 10,
        total_pages: 1,
      } as unknown as RechercheEntreprisesResponse;

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getEstablishmentsBySiren('123456789');

      expect(result).toEqual([]);

      sleepSpy.mockRestore();
    });
  });

  describe('fetchWithRateLimit', () => {
    const mockResponse: RechercheEntreprisesResponse = {
      results: [],
      total_results: 0,
      page: 1,
      per_page: 10,
      total_pages: 0,
    };

    it('should respect rate limiting (minRequestInterval)', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // Set lastRequestTime to simulate recent request
      service['lastRequestTime'] = 999950; // 50ms ago

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      await service['fetchWithRateLimit']('123456789');

      // Should wait 50ms to reach minRequestInterval of 100ms
      expect(sleepSpy).toHaveBeenCalledWith(50);

      sleepSpy.mockRestore();
    });

    it('should handle 404 status (company not found)', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 404,
        json: jest.fn(),
      } as any);

      const result = await service['fetchWithRateLimit']('999999999');

      expect(result).toEqual({
        results: [],
        total_results: 0,
        page: 1,
        per_page: 10,
        total_pages: 0,
      });

      sleepSpy.mockRestore();
    });

    it('should handle 429 rate limit with retry-after header', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // First call: rate limited
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue('2'),
        },
        json: jest.fn(),
        body: {
          json: jest.fn(),
        },
      } as any);

      // Second call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('123456789');

      expect(result).toEqual(mockResponse);
      expect(sleepSpy).toHaveBeenCalledWith(2000); // 2 seconds * 1000ms
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited'),
      );

      sleepSpy.mockRestore();
    });

    it('should handle 429 rate limit without retry-after header', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // First call: rate limited
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        json: jest.fn(),
      } as any);

      // Second call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('123456789');

      expect(result).toEqual(mockResponse);
      expect(sleepSpy).toHaveBeenCalledWith(1000); // retryDelay * 1

      sleepSpy.mockRestore();
    });

    it('should retry on transient errors up to maxRetries', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // First 2 calls: fail
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      // Third call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('123456789');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Retrying'),
      );

      sleepSpy.mockRestore();
    });

    it('should throw error after maxRetries exhausted', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        service['fetchWithRateLimit']('123456789'),
      ).rejects.toThrow('Network error');

      expect(mockFetch).toHaveBeenCalledTimes(3); // maxRetries = 3

      sleepSpy.mockRestore();
    });

    it('should throw error on non-200, non-404, non-429 status', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 500,
        json: jest.fn(),
      } as any);

      await expect(
        service['fetchWithRateLimit']('123456789'),
      ).rejects.toThrow('API returned status 500');

      sleepSpy.mockRestore();
    });
  });

  describe('sleep', () => {
    it('should sleep for the specified duration', async () => {
      jest.useFakeTimers();

      const sleepPromise = service['sleep'](1000);
      jest.advanceTimersByTime(1000);

      await expect(sleepPromise).resolves.toBeUndefined();

      jest.useRealTimers();
    });
  });
});
