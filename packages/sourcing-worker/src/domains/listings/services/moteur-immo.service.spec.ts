import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_TOKEN } from '../../../config';
import { MoteurImmoService } from './moteur-immo.service';
import { PropertyType } from '@linkinvests/shared';

// Mock global fetch
global.fetch = jest.fn();

const mockConfig = {
  MOTEUR_IMMO_API_KEY: 'test-api-key',
};

describe('MoteurImmoService', () => {
  let service: MoteurImmoService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoteurImmoService,
        {
          provide: CONFIG_TOKEN,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<MoteurImmoService>(MoteurImmoService);

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

  describe('buildApiRequestBody', () => {
    it('should build correct API request body with basic parameters', () => {
      const requestBody = service['buildApiRequestBody'](
        { afterDate: '2024-01-01' },
        1,
        50,
      );

      expect(requestBody).toEqual({
        apiKey: 'test-api-key',
        token: 'test-api-key',
        offset: 0,
      });
    });

    it('should handle pagination with offset', () => {
      const requestBody = service['buildApiRequestBody']({}, 3, 50);

      expect(requestBody).toEqual({
        apiKey: 'test-api-key',
        token: 'test-api-key',
        offset: 100, // (3 - 1) * 50
      });
    });

    it('should handle property type filters', () => {
      const requestBody = service['buildApiRequestBody'](
        {
          propertyTypes: ['apartment', 'house'],
        },
        1,
        50,
      );

      expect(requestBody).toEqual({
        apiKey: 'test-api-key',
        token: 'test-api-key',
        offset: 0,
        categories: ['flat', 'house'],
      });
    });

    it('should handle empty filters gracefully', () => {
      const requestBody = service['buildApiRequestBody']({}, 1, 50);

      expect(requestBody).toEqual({
        apiKey: 'test-api-key',
        token: 'test-api-key',
        offset: 0,
      });
    });
  });

  describe('transformListing', () => {
    const mockApiListing = {
      adId: 'test-123',
      reference: 'ref-123',
      origin: 'seloger',
      creationDate: '2024-01-15T10:00:00Z',
      lastCheckDate: '2024-01-16T11:00:00Z',
      publicationDate: '2024-01-15T10:00:00Z',
      lastModificationDate: '2024-01-16T11:00:00Z',
      lastEventDate: '2024-01-16T11:00:00Z',
      title: 'Appartement 3 pièces',
      type: 'sale',
      category: 'flat',
      publisher: {
        type: 'professional',
        name: 'Test Agency',
        email: 'test@agency.com',
        phone: '0123456789',
        address: '123 Agency Street',
        sirenNumber: '123456789',
      },
      description: 'Bel appartement en centre ville',
      url: 'https://moteurimmo.fr/listing/test-123',
      pictureUrl: 'image1.jpg',
      pictureUrls: ['image1.jpg', 'image2.jpg'],
      location: {
        city: 'Paris',
        postalCode: '75001',
        inseeCode: '75056',
        departmentCode: 75,
        regionCode: 12,
        coordinates: [2.3522, 48.8566] as [number, number], // [longitude, latitude]
        population: 2161000,
        propertyTaxRate: 14.13,
        district: undefined,
        isRightLocation: true,
      },
      position: [2.3522, 48.8566] as [number, number],
      price: 500000,
      priceDrop: undefined,
      rent: undefined,
      propertyCharges: undefined,
      propertyTax: undefined,
      rooms: 3,
      bedrooms: 2,
      pricePerSquareMeter: 6667,
      surface: 75,
      landSurface: undefined,
      constructionYear: 2020,
      floor: 2,
      buildingFloors: 5,
      options: ['hasGarage', 'hasBalcony'],
      energyValue: 120,
      energyGrade: 'C',
      gasValue: 25,
      gasGrade: 'C',
      diagnosticDate: '2024-01-10',
      priceStats: {
        rent: 2500,
        profitability: 0.06,
        priceGap: 0.1,
        lowPrice: 450000,
        medianPrice: 500000,
        highPrice: 550000,
        versionId: 1,
      },
      duplicates: [],
      uniqueId: 'unique-123',
      originalPrice: 520000,
    };

    it('should transform API listing to ListingInput format', () => {
      const result = service['transformListing'](mockApiListing);

      expect(result).toEqual({
        label: 'Appartement 3 pièces',
        address: 'Paris, 75001',
        zipCode: '75001',
        department: '75',
        latitude: 48.8566,
        longitude: 2.3522,
        opportunityDate: '2024-01-15T10:00:00Z',
        externalId: 'moteurimmo-test-123',
        url: 'https://moteurimmo.fr/listing/test-123',
        source: 'seloger',
        transactionType: 'sale',
        propertyType: PropertyType.APARTMENT,
        description: 'Bel appartement en centre ville',
        squareFootage: 75,
        rooms: 3,
        bedrooms: 2,
        energyClass: 'C',
        price: 500000,
        pictures: ['image1.jpg', 'image2.jpg'],
        mainPicture: 'image1.jpg',
      });
    });

    it('should map property types correctly', () => {
      expect(service['mapPropertyType']('flat')).toBe(PropertyType.APARTMENT);
      expect(service['mapPropertyType']('house')).toBe(PropertyType.HOUSE);
      expect(service['mapPropertyType']('land')).toBe(PropertyType.LAND);
      expect(service['mapPropertyType']('premises')).toBe(PropertyType.OTHER);
      expect(service['mapPropertyType']('unknown')).toBe(PropertyType.OTHER);
      expect(service['mapPropertyType'](undefined)).toBe(PropertyType.OTHER);
    });

    it('should handle missing fields gracefully', () => {
      const minimalListing = {
        adId: 'test-456',
        reference: 'ref-456',
        origin: 'seloger',
        creationDate: '2024-01-15T10:00:00Z',
        lastCheckDate: '2024-01-15T10:00:00Z',
        publicationDate: '2024-01-15T10:00:00Z',
        lastEventDate: '2024-01-15T10:00:00Z',
        title: 'Property',
        type: 'sale',
        category: 'other',
        publisher: {
          type: 'professional',
          name: 'Test Agency',
        },
        description: 'Test property',
        url: 'https://moteurimmo.fr/listing/test-456',
        pictureUrls: [],
        location: {
          city: 'Paris',
          postalCode: '75002',
          inseeCode: '75056',
          departmentCode: 75,
          regionCode: 12,
          coordinates: [2.3522, 48.8566] as [number, number],
          population: 2161000,
        },
        options: [],
        duplicates: [],
        uniqueId: 'unique-456',
      };

      const result = service['transformListing'](minimalListing);

      expect(result).toMatchObject({
        label: 'Property',
        address: 'Paris, 75002',
        zipCode: '75002',
        department: '75',
        externalId: 'moteurimmo-test-456',
        url: 'https://moteurimmo.fr/listing/test-456',
        source: 'seloger',
        latitude: 48.8566,
        longitude: 2.3522,
        transactionType: 'sale',
        propertyType: PropertyType.OTHER,
        pictures: [],
      });
    });

    it('should return null for invalid listings', () => {
      jest.spyOn(service['logger'], 'warn');

      const invalidListing = null as any;
      const result = service['transformListing'](invalidListing);

      expect(result).toBeNull();
      expect(service['logger']['warn']).toHaveBeenCalled();
    });
  });

  describe('fetchListingsPage', () => {
    const mockApiResponse = {
      ads: [
        {
          adId: 'test-1',
          reference: 'ref-1',
          origin: 'seloger',
          creationDate: '2024-01-15T10:00:00Z',
          lastCheckDate: '2024-01-15T10:00:00Z',
          publicationDate: '2024-01-15T10:00:00Z',
          lastEventDate: '2024-01-15T10:00:00Z',
          title: 'Test Property 1',
          type: 'sale',
          category: 'flat',
          publisher: {
            type: 'professional',
            name: 'Test Agency',
          },
          description: 'Test property',
          url: 'https://moteurimmo.fr/listing/test-1',
          pictureUrls: [],
          location: {
            city: 'Paris',
            postalCode: '75001',
            inseeCode: '75056',
            departmentCode: 75,
            regionCode: 12,
            coordinates: [2.3522, 48.8566] as [number, number],
            population: 2161000,
          },
          options: [],
          duplicates: [],
          uniqueId: 'unique-1',
        },
      ],
    };

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('should make successful API call with correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as any);

      const result = await service['fetchListingsPage'](
        { afterDate: '2024-01-01' },
        1,
        50,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://moteurimmo.fr/api/ads',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify({
            apiKey: 'test-api-key',
            token: 'test-api-key',
            offset: 0,
          }),
          signal: expect.any(AbortSignal),
        }),
      );

      expect(result).toEqual(mockApiResponse.ads);
    });

    it('should enforce rate limiting', async () => {
      // Mock multiple calls within rate limit interval
      let callTime = 1000000;
      jest.spyOn(Date, 'now').mockImplementation(() => {
        const time = callTime;
        callTime += 100; // Increment by 100ms each call
        return time;
      });

      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as any);

      // First call should not trigger rate limiting
      await service['fetchListingsPage']({ afterDate: '2024-01-01' }, 1, 100);
      expect(sleepSpy).not.toHaveBeenCalled();

      // Second call should trigger rate limiting (less than 250ms since last call)
      await service['fetchListingsPage']({ afterDate: '2024-01-01' }, 2, 100);
      expect(sleepSpy).toHaveBeenCalledWith(150); // 250 - 100 = 150ms delay
    });

    it('should handle 429 rate limit responses', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // First call returns 429
      mockFetch.mockResolvedValueOnce({
        status: 429,
        headers: {
          get: jest.fn().mockReturnValue('5'), // retry-after: 5 seconds
        },
      } as any);

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as any);

      const result = await service['fetchListingsPage'](
        { afterDate: '2024-01-01' },
        1,
        50,
      );

      expect(sleepSpy).toHaveBeenCalledWith(5000); // 5 seconds
      expect(result).toEqual(mockApiResponse.ads);
    });

    it('should retry on failure with exponential backoff', async () => {
      const sleepSpy = jest
        .spyOn(service as any, 'sleep')
        .mockResolvedValue(undefined);

      // First two calls fail
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          json: jest.fn().mockResolvedValue(mockApiResponse),
        } as any);

      const result = await service['fetchListingsPage'](
        { afterDate: '2024-01-01' },
        1,
        50,
      );

      expect(sleepSpy).toHaveBeenCalledTimes(2);
      expect(sleepSpy).toHaveBeenNthCalledWith(1, 2000); // First retry: 2s
      expect(sleepSpy).toHaveBeenNthCalledWith(2, 4000); // Second retry: 4s
      expect(result).toEqual(mockApiResponse.ads);
    });

    it('should throw error after max retries', async () => {
      jest.spyOn(service as any, 'sleep').mockResolvedValue(undefined);

      // All calls fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        service['fetchListingsPage']({ afterDate: '2024-01-01' }, 1, 50),
      ).rejects.toThrow('Network error');

      expect(mockFetch).toHaveBeenCalledTimes(3); // Max retries
    });

    it('should handle non-200 status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      } as any);

      await expect(
        service['fetchListingsPage']({ afterDate: '2024-01-01' }, 1, 50),
      ).rejects.toThrow('Moteur Immo API returned status 400: Bad Request');
    });
  });

  describe('getListings', () => {
    const mockListingsPage1 = [
      {
        adId: '1',
        reference: 'ref-1',
        origin: 'seloger',
        creationDate: '2024-01-15T10:00:00Z',
        lastCheckDate: '2024-01-15T10:00:00Z',
        publicationDate: '2024-01-15T10:00:00Z',
        lastEventDate: '2024-01-15T10:00:00Z',
        title: 'Property 1',
        type: 'sale',
        category: 'flat',
        publisher: { type: 'professional', name: 'Agency 1' },
        description: 'Property 1',
        url: 'https://test1.com',
        pictureUrls: [],
        location: {
          city: 'Paris',
          postalCode: '75001',
          inseeCode: '75056',
          departmentCode: 75,
          regionCode: 12,
          coordinates: [2.3522, 48.8566] as [number, number],
          population: 2161000,
        },
        options: [],
        duplicates: [],
        uniqueId: 'unique-1',
      },
      {
        adId: '2',
        reference: 'ref-2',
        origin: 'seloger',
        creationDate: '2024-01-15T10:00:00Z',
        lastCheckDate: '2024-01-15T10:00:00Z',
        publicationDate: '2024-01-15T10:00:00Z',
        lastEventDate: '2024-01-15T10:00:00Z',
        title: 'Property 2',
        type: 'sale',
        category: 'house',
        publisher: { type: 'professional', name: 'Agency 2' },
        description: 'Property 2',
        url: 'https://test2.com',
        pictureUrls: [],
        location: {
          city: 'Paris',
          postalCode: '75002',
          inseeCode: '75056',
          departmentCode: 75,
          regionCode: 12,
          coordinates: [2.3522, 48.8566] as [number, number],
          population: 2161000,
        },
        options: [],
        duplicates: [],
        uniqueId: 'unique-2',
      },
    ];

    const mockListingsPage2 = [
      {
        adId: '3',
        reference: 'ref-3',
        origin: 'seloger',
        creationDate: '2024-01-15T10:00:00Z',
        lastCheckDate: '2024-01-15T10:00:00Z',
        publicationDate: '2024-01-15T10:00:00Z',
        lastEventDate: '2024-01-15T10:00:00Z',
        title: 'Property 3',
        type: 'sale',
        category: 'land',
        publisher: { type: 'professional', name: 'Agency 3' },
        description: 'Property 3',
        url: 'https://test3.com',
        pictureUrls: [],
        location: {
          city: 'Paris',
          postalCode: '75003',
          inseeCode: '75056',
          departmentCode: 75,
          regionCode: 12,
          coordinates: [2.3522, 48.8566] as [number, number],
          population: 2161000,
        },
        options: [],
        duplicates: [],
        uniqueId: 'unique-3',
      },
    ];

    beforeEach(() => {
      // Mock fetchListingsPage method
      jest
        .spyOn(service as any, 'fetchListingsPage')
        .mockResolvedValueOnce(mockListingsPage1) // First page
        .mockResolvedValueOnce(mockListingsPage2) // Second page
        .mockResolvedValueOnce([]); // Third page (empty, indicating end)
    });

    it('should fetch all pages and transform results', async () => {
      const result = await service.getListings({
        afterDate: '2024-01-01',
        energyClassClasses: ['E', 'F'],
      });

      expect(result).toHaveLength(3);
      expect(
        result.every((listing) => listing.source === 'seloger'),
      ).toBe(true);
    });

    it('should handle empty results', async () => {
      jest.spyOn(service as any, 'fetchListingsPage').mockResolvedValueOnce([]);

      const result = await service.getListings({ afterDate: '2024-01-01' });

      expect(result).toEqual([]);
    });

    it('should handle pagination errors gracefully', async () => {
      jest
        .spyOn(service as any, 'fetchListingsPage')
        .mockResolvedValueOnce(mockListingsPage1) // First page succeeds
        .mockRejectedValueOnce(new Error('API limit reached')); // Second page fails

      const result = await service.getListings({ afterDate: '2024-01-01' });

      // Should return listings from successful page
      expect(result).toHaveLength(2);
      expect(service['logger']['warn']).toHaveBeenCalledWith(
        expect.stringContaining('Reached API pagination limit'),
      );
    });
  });

  describe('sleep', () => {
    it('should sleep for specified duration', async () => {
      // Mock setTimeout to resolve immediately for testing
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      await service['sleep'](1000);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });
});
