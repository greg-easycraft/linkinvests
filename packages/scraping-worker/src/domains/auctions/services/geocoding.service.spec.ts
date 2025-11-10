import { Test, TestingModule } from '@nestjs/testing';
import { AuctionsGeocodingService } from './geocoding.service';
import type { RawAuctionOpportunity, AuctionOpportunity } from '../types';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AuctionsGeocodingService', () => {
  let service: AuctionsGeocodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuctionsGeocodingService],
    }).compile();

    service = module.get<AuctionsGeocodingService>(AuctionsGeocodingService);

    // Suppress logger
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();

    // Mock sleep to avoid delays in tests
    jest.spyOn(service as any, 'sleep').mockResolvedValue(undefined);

    // Mock Date.now for rate limiting tests
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('geocodeBatch', () => {
    const mockOpportunities: RawAuctionOpportunity[] = [
      {
        url: 'https://test.com/1',
        label: 'Test Property 1',
        address: '1 Rue de la Paix, 75001 Paris, France',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: { url: 'https://test.com/1' },
      },
      {
        url: 'https://test.com/2',
        label: 'Test Property 2',
        address: '2 Avenue des Champs-Élysées, 75008 Paris, France',
        city: 'Paris',
        department: 75,
        latitude: 48.8738,
        longitude: 2.2950,
        auctionDate: '2025-01-02',
        extraData: { url: 'https://test.com/2' },
      },
    ];

    const mockGeocodingResponse = {
      features: [
        {
          properties: {
            score: 0.8,
            postcode: '75001',
          },
          geometry: {
            coordinates: [2.3522, 48.8566], // [longitude, latitude]
          },
        },
      ],
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(mockGeocodingResponse),
      } as any);
    });

    it('should geocode all opportunities successfully', async () => {
      const result = await service.geocodeBatch(mockOpportunities);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockOpportunities[0],
        zipCode: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });
      expect(result[1]).toEqual({
        ...mockOpportunities[1],
        zipCode: 75008, // From original address parsing
        latitude: 48.8566,
        longitude: 2.3522,
      });
    });

    it('should skip opportunities that are already geocoded', async () => {
      const alreadyGeocodedOpportunities: RawAuctionOpportunity[] = [
        {
          ...mockOpportunities[0],
          latitude: 48.1234,
          longitude: 2.5678,
        },
        mockOpportunities[1], // Not geocoded
      ];

      const result = await service.geocodeBatch(alreadyGeocodedOpportunities);

      expect(mockFetch).toHaveBeenCalledTimes(1); // Only for the second opportunity
      expect(result).toHaveLength(2);
      expect(result[0].latitude).toBe(48.1234); // Preserved original
      expect(result[0].longitude).toBe(2.5678); // Preserved original
    });

    it('should handle empty opportunities array', async () => {
      const result = await service.geocodeBatch([]);

      expect(result).toHaveLength(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle geocoding failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.geocodeBatch(mockOpportunities);

      expect(result).toHaveLength(2);
      expect(result[0].latitude).toBeUndefined();
      expect(result[0].longitude).toBeUndefined();
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to geocode address after retries:',
        '1 Rue de la Paix, 75001 Paris, France',
        expect.any(Error)
      );
    });

    it('should enforce rate limiting between requests', async () => {
      let callTime = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        callTime += 10; // Only 10ms between calls (less than 25ms minimum)
        return callTime;
      });

      await service.geocodeBatch(mockOpportunities);

      // Should call sleep to enforce rate limiting
      expect(service['sleep']).toHaveBeenCalledWith(15); // 25 - 10 = 15ms
    });

    it('should not add delay when rate limit is already satisfied', async () => {
      let callTime = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        callTime += 30; // 30ms between calls (more than 25ms minimum)
        return callTime;
      });

      await service.geocodeBatch(mockOpportunities);

      // Should not call sleep when rate limit is satisfied
      expect(service['sleep']).not.toHaveBeenCalled();
    });
  });

  describe('geocodeAddress', () => {
    const testAddress = '1 Rue de la Paix, 75001 Paris, France';
    const mockSuccessResponse = {
      features: [
        {
          properties: {
            score: 0.8,
            postcode: '75001',
          },
          geometry: {
            coordinates: [2.3522, 48.8566],
          },
        },
      ],
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(mockSuccessResponse),
      } as any);
    });

    it('should geocode address successfully', async () => {
      const result = await service['geocodeAddress'](testAddress);

      expect(result).toEqual({
        zipCode: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://data.geopf.fr/geocodage/search'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('NodeJS'),
          }),
        })
      );
    });

    it('should handle low confidence scores', async () => {
      const lowConfidenceResponse = {
        features: [
          {
            properties: {
              score: 0.3, // Below 0.5 threshold
              postcode: '75001',
            },
            geometry: {
              coordinates: [2.3522, 48.8566],
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(lowConfidenceResponse),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        `Low confidence geocoding result for "${testAddress}": 0.3`
      );
    });

    it('should handle 429 rate limit responses with retry-after header', async () => {
      const retryAfterHeaders = new Map([['retry-after', '2']]);

      mockFetch
        .mockResolvedValueOnce({
          status: 429,
          headers: retryAfterHeaders,
        } as any)
        .mockResolvedValueOnce({
          status: 200,
          headers: new Map(),
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toEqual({
        zipCode: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(service['sleep']).toHaveBeenCalledWith(2000); // 2 seconds from retry-after
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle 429 rate limit responses without retry-after header', async () => {
      mockFetch
        .mockResolvedValueOnce({
          status: 429,
          headers: new Map(),
        } as any)
        .mockResolvedValueOnce({
          status: 200,
          headers: new Map(),
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toEqual({
        zipCode: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(service['sleep']).toHaveBeenCalledWith(1000); // Default 1 second delay
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry with exponential backoff on failures', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          headers: new Map(),
          json: jest.fn().mockResolvedValue(mockSuccessResponse),
        } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toEqual({
        zipCode: 75001,
        latitude: 48.8566,
        longitude: 2.3522,
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(service['sleep']).toHaveBeenCalledWith(1000); // First retry: 1s
      expect(service['sleep']).toHaveBeenCalledWith(2000); // Second retry: 2s
    });

    it('should give up after maximum retries', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Geocoding failed after 3 retries:',
        expect.any(Error)
      );
    });

    it('should handle non-200 status codes', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map(),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Geocoding API error: 500 Internal Server Error'
      );
    });

    it('should handle empty features array', async () => {
      const emptyResponse = { features: [] };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(emptyResponse),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        `No geocoding results for "${testAddress}"`
      );
    });

    it('should handle malformed API response', async () => {
      const malformedResponse = { invalid: 'response' };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(malformedResponse),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
    });

    it('should handle missing coordinates in response', async () => {
      const responseWithoutCoords = {
        features: [
          {
            properties: {
              score: 0.8,
              postcode: '75001',
            },
            geometry: {
              // Missing coordinates
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(responseWithoutCoords),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toBeNull();
    });

    it('should handle missing postcode in response', async () => {
      const responseWithoutPostcode = {
        features: [
          {
            properties: {
              score: 0.8,
              // Missing postcode
            },
            geometry: {
              coordinates: [2.3522, 48.8566],
            },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(responseWithoutPostcode),
      } as any);

      const result = await service['geocodeAddress'](testAddress);

      expect(result).toEqual({
        zipCode: 0, // Default when postcode is missing
        latitude: 48.8566,
        longitude: 2.3522,
      });
    });
  });

  describe('formatAddressForRequest', () => {
    it('should format complete opportunity address', () => {
      const opportunity: RawAuctionOpportunity = {
        url: 'https://test.com/1',
        label: 'Test Property',
        address: '1 Rue de la Paix, 75001 Paris',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: {},
      };

      const result = service['formatAddressForRequest'](opportunity);

      expect(result).toBe('1 Rue de la Paix, 75001 Paris, France');
    });

    it('should add France if not present', () => {
      const opportunity: RawAuctionOpportunity = {
        url: 'https://test.com/1',
        label: 'Test Property',
        address: '1 Rue de la Paix, Paris',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: {},
      };

      const result = service['formatAddressForRequest'](opportunity);

      expect(result).toBe('1 Rue de la Paix, Paris, France');
    });

    it('should not add France if already present', () => {
      const opportunity: RawAuctionOpportunity = {
        url: 'https://test.com/1',
        label: 'Test Property',
        address: '1 Rue de la Paix, 75001 Paris, France',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: {},
      };

      const result = service['formatAddressForRequest'](opportunity);

      expect(result).toBe('1 Rue de la Paix, 75001 Paris, France');
    });

    it('should handle empty address', () => {
      const opportunity: RawAuctionOpportunity = {
        url: 'https://test.com/1',
        label: 'Test Property',
        address: '',
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: {},
      };

      const result = service['formatAddressForRequest'](opportunity);

      expect(result).toBe(', France');
    });

    it('should handle null address', () => {
      const opportunity: RawAuctionOpportunity = {
        url: 'https://test.com/1',
        label: 'Test Property',
        address: null as any,
        city: 'Paris',
        department: 75,
        latitude: 48.8566,
        longitude: 2.3522,
        auctionDate: '2025-01-01',
        extraData: {},
      };

      const result = service['formatAddressForRequest'](opportunity);

      expect(result).toBe('null, France');
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      // Restore original sleep implementation for this test
      (service as any).sleep.mockRestore();
    });

    it('should wait for specified milliseconds', async () => {
      const startTime = Date.now();
      await service['sleep'](100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    it('should handle zero milliseconds', async () => {
      const startTime = Date.now();
      await service['sleep'](0);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be almost instant
    });
  });

  describe('rate limiting integration', () => {
    beforeEach(() => {
      // Restore original sleep implementation
      (service as any).sleep.mockRestore();

      // Mock a faster sleep for testing
      jest.spyOn(service as any, 'sleep').mockImplementation((ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 10))); // Cap at 10ms for tests
      });
    });

    it('should respect rate limiting in real time', async () => {
      const opportunities: RawAuctionOpportunity[] = [
        {
          url: 'https://test.com/1',
          label: 'Test 1',
          address: 'Address 1',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          auctionDate: '2025-01-01',
          extraData: {},
        },
        {
          url: 'https://test.com/2',
          label: 'Test 2',
          address: 'Address 2',
          city: 'Paris',
          department: 75,
          latitude: 48.8566,
          longitude: 2.3522,
          auctionDate: '2025-01-02',
          extraData: {},
        },
      ];

      const mockResponse = {
        features: [
          {
            properties: { score: 0.8, postcode: '75001' },
            geometry: { coordinates: [2.3522, 48.8566] },
          },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        headers: new Map(),
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const startTime = Date.now();
      await service.geocodeBatch(opportunities);
      const endTime = Date.now();

      // Should have some delay between requests
      expect(endTime - startTime).toBeGreaterThan(0);
    });
  });
});
