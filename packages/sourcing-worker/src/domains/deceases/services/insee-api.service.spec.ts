import { Test, TestingModule } from '@nestjs/testing';

import type {
  ApiGouvCommuneResponse,
  ApiLannuaireResponse,
} from '../types/deceases.types';
import { InseeApiService } from './insee-api.service';

describe('InseeApiService', () => {
  let service: InseeApiService;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    // Use fake timers to speed up tests
    jest.useFakeTimers();

    // Mock global fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [InseeApiService],
    }).compile();

    service = module.get<InseeApiService>(InseeApiService);

    // Suppress logger output in tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('fetchCommuneCoordinates', () => {
    const mockCommuneResponse: ApiGouvCommuneResponse = {
      nom: 'Paris',
      code: '75056',
      codeDepartement: '75',
      codeRegion: '11',
      codesPostaux: ['75001'],
      population: 2165423,
      centre: {
        type: 'Point',
        coordinates: [2.3522, 48.8566],
      },
    };

    it('should return coordinates when commune is found', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockCommuneResponse,
      });

      const result = await service.fetchCommuneCoordinates('75056');

      expect(result).toEqual({
        longitude: 2.3522,
        latitude: 48.8566,
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://geo.api.gouv.fr/communes/75056?fields=centre',
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    it('should return null when commune has no coordinates', async () => {
      const responseWithoutCentre = {
        ...mockCommuneResponse,
        centre: undefined,
      };
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => responseWithoutCentre,
      });

      const result = await service.fetchCommuneCoordinates('75056');

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const promise = service.fetchCommuneCoordinates('75056');

      // Fast-forward through all timers (retries)
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBeNull();
    });

    it('should retry on 429 rate limit response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          status: 429,
          headers: {
            get: () => '1', // retry-after 1 second
          },
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => mockCommuneResponse,
        });

      const promise = service.fetchCommuneCoordinates('75056');

      // Fast-forward through rate limit delay
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual({
        longitude: 2.3522,
        latitude: 48.8566,
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should return null after max retries on failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const promise = service.fetchCommuneCoordinates('75056');

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(3); // maxRetries
    });
  });

  describe('fetchMairieInfo', () => {
    const mockMairieResponse: ApiLannuaireResponse = {
      total_count: 1,
      results: [
        {
          nom: 'Mairie de Paris',
          telephone: '01 42 76 40 40',
          email: 'contact@paris.fr',
        },
      ],
    };

    it('should return mairie info when found', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockMairieResponse,
      });

      const result = await service.fetchMairieInfo('75056');

      expect(result).toEqual({
        name: 'Mairie de Paris',
        telephone: '01 42 76 40 40',
        email: 'contact@paris.fr',
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should use default values when fields are missing', async () => {
      const responseWithMissingFields: ApiLannuaireResponse = {
        total_count: 1,
        results: [
          {
            nom: 'Mairie de Test',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => responseWithMissingFields,
      });

      const result = await service.fetchMairieInfo('75056');

      expect(result).toEqual({
        name: 'Mairie de Test',
        telephone: '',
        email: '',
      });
    });

    it('should use fallback telephone field', async () => {
      const responseWithFallbackPhone: ApiLannuaireResponse = {
        total_count: 1,
        results: [
          {
            nom: 'Mairie de Test',
            telephone_accueil: '01 23 45 67 89',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => responseWithFallbackPhone,
      });

      const result = await service.fetchMairieInfo('75056');

      expect(result?.telephone).toEqual('01 23 45 67 89');
    });

    it('should use fallback email field', async () => {
      const responseWithFallbackEmail: ApiLannuaireResponse = {
        total_count: 1,
        results: [
          {
            nom: 'Mairie de Test',
            adresse_courriel: 'test@mairie.fr',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => responseWithFallbackEmail,
      });

      const result = await service.fetchMairieInfo('75056');

      expect(result?.email).toEqual('test@mairie.fr');
    });

    it('should return null when no mairie is found', async () => {
      const emptyResponse: ApiLannuaireResponse = {
        total_count: 0,
        results: [],
      };

      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => emptyResponse,
      });

      const result = await service.fetchMairieInfo('75056');

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const promise = service.fetchMairieInfo('75056');

      // Fast-forward through all timers (retries)
      await jest.runAllTimersAsync();

      const result = await promise;

      expect(result).toBeNull();
    });
  });

  describe('rate limiting', () => {
    it('should enforce minimum request interval', async () => {
      // Use real timers for this specific test
      jest.useRealTimers();

      const mockResponse: ApiGouvCommuneResponse = {
        nom: 'Test',
        code: '75056',
        codeDepartement: '75',
        codeRegion: '11',
        codesPostaux: ['75001'],
        population: 100000,
        centre: {
          type: 'Point',
          coordinates: [2.3522, 48.8566],
        },
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: async () => mockResponse,
      });

      const startTime = Date.now();

      // Make two requests back-to-back
      await service.fetchCommuneCoordinates('75056');
      await service.fetchCommuneCoordinates('75057');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 100ms due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(100);

      // Restore fake timers
      jest.useFakeTimers();
    });
  });
});
