import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingApiService } from './geocoding-api.service';
import type { GeocodingResponse } from '../types/geocoding.types';

// Mock global fetch
global.fetch = jest.fn();

describe('GeocodingApiService', () => {
  let service: GeocodingApiService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocodingApiService],
    }).compile();

    service = module.get<GeocodingApiService>(GeocodingApiService);

    // Suppress logger output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
    jest.spyOn(service['logger'], 'debug').mockImplementation();

    // Mock Date.now() for rate limiting tests
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('geocodeAddress', () => {
    const mockGeocodingResponse: GeocodingResponse = {
      type: 'FeatureCollection',
      version: '1.0',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [2.3522, 48.8566], // [longitude, latitude]
          },
          properties: {
            label: '123 Rue de Test 75001 Paris',
            score: 0.9,
            id: 'test-id',
            type: 'housenumber',
            name: '123 Rue de Test',
            postcode: '75001',
            citycode: '75101',
            x: 652089.58,
            y: 6862305.26,
            city: 'Paris',
            context: '75, Paris, Île-de-France',
            importance: 0.6,
            street: 'Rue de Test',
          },
        },
      ],
      attribution: 'BAN',
      licence: 'ETALAB-2.0',
      query: '123 Rue de Test 75001 Paris',
      limit: 5,
    };

    it('should successfully geocode an address', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      const result = await service.geocodeAddress(
        '123 Rue de Test 75001 Paris',
      );

      expect(result).toEqual({
        latitude: 48.8566,
        longitude: 2.3522,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api-adresse.data.gouv.fr/search/?q=123%20Rue%20de%20Test%2075001%20Paris',
        ),
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal),
        }),
      );

      sleepSpy.mockRestore();
    });

    it('should return null for empty address', async () => {
      const result = await service.geocodeAddress('');

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        'Empty address provided for geocoding',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null for whitespace-only address', async () => {
      const result = await service.geocodeAddress('   ');

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        'Empty address provided for geocoding',
      );
    });

    it('should return null when no results found', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          type: 'FeatureCollection',
          features: [],
        }),
      } as any);

      const result = await service.geocodeAddress('Invalid Address 99999');

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('No geocoding results found'),
      );

      sleepSpy.mockRestore();
    });

    it('should return null when features is undefined', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          type: 'FeatureCollection',
        }),
      } as any);

      const result = await service.geocodeAddress('Test Address');

      expect(result).toBeNull();

      sleepSpy.mockRestore();
    });

    it('should return null when score is below minimum threshold', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const lowScoreResponse = {
        ...mockGeocodingResponse,
        features: [
          {
            ...mockGeocodingResponse.features[0],
            properties: {
              ...mockGeocodingResponse.features[0].properties,
              score: 0.3, // Below minScore of 0.5
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(lowScoreResponse),
      } as any);

      const result = await service.geocodeAddress('Ambiguous Address');

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Low geocoding confidence'),
      );

      sleepSpy.mockRestore();
    });

    it('should accept score at minimum threshold', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      const minScoreResponse = {
        ...mockGeocodingResponse,
        features: [
          {
            ...mockGeocodingResponse.features[0],
            properties: {
              ...mockGeocodingResponse.features[0].properties,
              score: 0.5, // Exactly minScore
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(minScoreResponse),
      } as any);

      const result = await service.geocodeAddress('Test Address');

      expect(result).not.toBeNull();
      expect(result?.latitude).toBe(48.8566);

      sleepSpy.mockRestore();
    });

    it('should return null on API error', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.geocodeAddress('Test Address');

      expect(result).toBeNull();
      expect(service['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to geocode address'),
        expect.any(String),
      );

      sleepSpy.mockRestore();
    });

    it('should encode special characters in address', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      await service.geocodeAddress("123 Rue de l'Église & Co");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("123%20Rue%20de%20l'%C3%89glise%20%26%20Co"),
        expect.any(Object),
      );

      sleepSpy.mockRestore();
    });
  });

  describe('fetchWithRateLimit', () => {
    const mockGeocodingResponse: GeocodingResponse = {
      type: 'FeatureCollection',
      version: '1.0',
      features: [],
      attribution: 'BAN',
      licence: 'ETALAB-2.0',
      query: 'test',
      limit: 5,
    };

    it('should respect rate limiting (minRequestInterval)', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // Set lastRequestTime to simulate recent request
      service['lastRequestTime'] = 999980; // 20ms ago

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      await service['fetchWithRateLimit']('Test Address');

      // Should wait 5ms to reach minRequestInterval of 25ms
      expect(sleepSpy).toHaveBeenCalledWith(5);

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
          get: jest.fn().mockReturnValue('1'),
        },
        json: jest.fn(),
      } as any);

      // Second call: success
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('Test Address');

      expect(result).toEqual(mockGeocodingResponse);
      expect(sleepSpy).toHaveBeenCalledWith(1000); // 1 second * 1000ms
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
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('Test Address');

      expect(result).toEqual(mockGeocodingResponse);
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
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);

      const result = await service['fetchWithRateLimit']('Test Address');

      expect(result).toEqual(mockGeocodingResponse);
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
        service['fetchWithRateLimit']('Test Address'),
      ).rejects.toThrow('Network error');

      expect(mockFetch).toHaveBeenCalledTimes(3); // maxRetries = 3

      sleepSpy.mockRestore();
    });

    it('should throw error on non-200, non-429 status', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 500,
        json: jest.fn(),
      } as any);

      await expect(
        service['fetchWithRateLimit']('Test Address'),
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
