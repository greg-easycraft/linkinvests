import { Test, TestingModule } from '@nestjs/testing';
import { DetailScraperService } from './detail-scraper.service';
import { BrowserService } from './browser.service';
import type { Page } from 'playwright';

// Import example JSON data
import exampleJson from './example.json';
import exampleAddressJson from './example-address.json';

describe('DetailScraperService', () => {
  let service: DetailScraperService;
  let browserService: BrowserService;
  let mockPage: jest.Mocked<Page>;

  const mockBrowserService = {
    getPage: jest.fn(),
    navigateToUrl: jest.fn(),
    delay: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetailScraperService,
        { provide: BrowserService, useValue: mockBrowserService },
      ],
    }).compile();

    service = module.get<DetailScraperService>(DetailScraperService);
    browserService = module.get<BrowserService>(BrowserService);

    // Mock page object
    mockPage = {
      evaluate: jest.fn(),
      goto: jest.fn(),
      waitForLoadState: jest.fn(),
    } as any;

    mockBrowserService.getPage.mockReturnValue(mockPage);
    mockBrowserService.navigateToUrl.mockResolvedValue(undefined);
    mockBrowserService.delay.mockResolvedValue(undefined);

    // Suppress logger
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('scrapeDetails', () => {
    const testUrl = 'https://encheres-publiques.fr/lot/test-123';

    it('should scrape auction details successfully with address object', async () => {
      // Mock page evaluation to return example JSON data
      mockPage.evaluate.mockResolvedValue(exampleAddressJson);

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeDefined();
      expect(result.url).toBe(testUrl);
      expect(result.label).toBe(
        'Une maison/villa située rue Mahé de la Bourdonnais à St Malo'
      );
      expect(result.address).toBe(
        '8 Rue Mahé de la Bourdonnais, 35400 Saint-Malo, France'
      );
      expect(result.city).toBe('Saint-Malo');
      expect(result.department).toBe(35);
      expect(result.latitude).toBe(48.651272);
      expect(result.longitude).toBe(-2.0259);
      expect(result.auctionDate).toBeDefined();
      expect(result.extraData).toEqual({ url: testUrl });
    });

    it('should scrape auction details successfully without address object', async () => {
      // Mock page evaluation to return example JSON without address
      mockPage.evaluate.mockResolvedValue(exampleJson);

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeDefined();
      expect(result.url).toBe(testUrl);
      expect(result.label).toBe('Une maison de 107 m²');
      expect(result.address).toBe('Oinville-Sous-Auneau');
      expect(result.city).toBe('Oinville-Sous-Auneau');
      expect(result.department).toBe(28); // Eure-et-Loir
      expect(result.latitude).toBeUndefined();
      expect(result.longitude).toBeUndefined();
      expect(result.auctionDate).toBeDefined();
    });

    it('should handle missing __NEXT_DATA__ gracefully', async () => {
      mockPage.evaluate.mockResolvedValue(null);

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        `No __NEXT_DATA__ found for ${testUrl}`
      );
    });

    it('should handle malformed JSON gracefully', async () => {
      mockPage.evaluate.mockResolvedValue('invalid-json');

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeNull();
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Failed to parse JSON for ${testUrl}:`,
        expect.any(Error)
      );
    });

    it('should handle navigation failures', async () => {
      mockBrowserService.navigateToUrl.mockRejectedValue(
        new Error('Navigation failed')
      );

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeNull();
      expect(service['logger'].error).toHaveBeenCalledWith(
        `Failed to scrape details for ${testUrl}:`,
        expect.any(Error)
      );
    });

    it('should handle missing lot data gracefully', async () => {
      const emptyJson = {
        props: {
          pageProps: {
            apolloState: {
              data: {},
            },
          },
        },
      };
      mockPage.evaluate.mockResolvedValue(emptyJson);

      const result = await service.scrapeDetails(testUrl);

      expect(result).toBeNull();
      expect(service['logger'].warn).toHaveBeenCalledWith(
        `No lot data found for ${testUrl}`
      );
    });
  });

  describe('scrapeDetailsBatch', () => {
    const testUrls = [
      'https://encheres-publiques.fr/lot/test-1',
      'https://encheres-publiques.fr/lot/test-2',
      'https://encheres-publiques.fr/lot/test-3',
    ];

    it('should process multiple URLs with rate limiting', async () => {
      mockPage.evaluate.mockResolvedValue(exampleJson);

      const results = await service.scrapeDetailsBatch(testUrls, 2);

      expect(results).toHaveLength(3);
      expect(mockBrowserService.delay).toHaveBeenCalledTimes(2); // Between batches
      expect(mockBrowserService.delay).toHaveBeenCalledWith(2000);
    });

    it('should handle individual failures without stopping batch', async () => {
      mockPage.evaluate
        .mockResolvedValueOnce(exampleJson) // First URL succeeds
        .mockRejectedValueOnce(new Error('Page error')) // Second URL fails
        .mockResolvedValueOnce(exampleJson); // Third URL succeeds

      const results = await service.scrapeDetailsBatch(testUrls, 1);

      expect(results).toHaveLength(2); // Only successful results
      expect(results.every((r) => r !== null)).toBe(true);
    });

    it('should handle empty URL array', async () => {
      const results = await service.scrapeDetailsBatch([], 2);

      expect(results).toHaveLength(0);
      expect(mockBrowserService.delay).not.toHaveBeenCalled();
    });

    it('should process with custom batch size', async () => {
      mockPage.evaluate.mockResolvedValue(exampleJson);

      const results = await service.scrapeDetailsBatch(testUrls, 1);

      expect(results).toHaveLength(3);
      expect(mockBrowserService.delay).toHaveBeenCalledTimes(2); // Between each item
    });
  });

  describe('extractJsonData', () => {
    it('should extract __NEXT_DATA__ from page successfully', async () => {
      const mockJsonData = { test: 'data' };
      mockPage.evaluate.mockResolvedValue(mockJsonData);

      const result = await service['extractJsonData'](mockPage);

      expect(result).toEqual(mockJsonData);
      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should return null when __NEXT_DATA__ is missing', async () => {
      mockPage.evaluate.mockResolvedValue(null);

      const result = await service['extractJsonData'](mockPage);

      expect(result).toBeNull();
    });

    it('should handle page evaluation errors', async () => {
      mockPage.evaluate.mockRejectedValue(new Error('Evaluation failed'));

      await expect(service['extractJsonData'](mockPage)).rejects.toThrow(
        'Evaluation failed'
      );
    });
  });

  describe('parseAuctionDataFromJson', () => {
    const testUrl = 'https://encheres-publiques.fr/lot/test-123';

    it('should parse auction data with address object', () => {
      const result = service['parseAuctionDataFromJson'](
        exampleAddressJson,
        testUrl
      );

      expect(result).toBeDefined();
      expect(result.label).toBe(
        'Une maison/villa située rue Mahé de la Bourdonnais à St Malo'
      );
      expect(result.address).toBe(
        '8 Rue Mahé de la Bourdonnais, 35400 Saint-Malo, France'
      );
      expect(result.city).toBe('Saint-Malo');
      expect(result.department).toBe(35);
      expect(result.latitude).toBe(48.651272);
      expect(result.longitude).toBe(-2.0259);
    });

    it('should parse auction data without address object', () => {
      const result = service['parseAuctionDataFromJson'](exampleJson, testUrl);

      expect(result).toBeDefined();
      expect(result.label).toBe('Une maison de 107 m²');
      expect(result.address).toBe('Oinville-Sous-Auneau');
      expect(result.city).toBe('Oinville-Sous-Auneau');
      expect(result.department).toBe(28);
      expect(result.latitude).toBeUndefined();
      expect(result.longitude).toBeUndefined();
    });

    it('should handle missing lot data', () => {
      const emptyJson = {
        props: {
          pageProps: {
            apolloState: {
              data: {},
            },
          },
        },
      };

      const result = service['parseAuctionDataFromJson'](emptyJson, testUrl);

      expect(result).toBeNull();
    });

    it('should handle malformed JSON structure', () => {
      const malformedJson = { invalid: 'structure' };

      const result = service['parseAuctionDataFromJson'](
        malformedJson,
        testUrl
      );

      expect(result).toBeNull();
    });
  });

  describe('extractTitleFromNom', () => {
    it('should remove "située à" suffix', () => {
      const nom = 'Une maison de 107 m² située à Oinville-Sous-Auneau';
      const result = service['extractTitleFromNom'](nom);

      expect(result).toBe('Une maison de 107 m²');
    });

    it('should remove "situé à" suffix', () => {
      const nom = 'Un appartement situé à Paris';
      const result = service['extractTitleFromNom'](nom);

      expect(result).toBe('Un appartement');
    });

    it('should handle title without location suffix', () => {
      const nom = 'Une maison moderne';
      const result = service['extractTitleFromNom'](nom);

      expect(result).toBe('Une maison moderne');
    });

    it('should handle empty or null title', () => {
      expect(service['extractTitleFromNom']('')).toBe('');
      expect(service['extractTitleFromNom'](null as any)).toBe('');
      expect(service['extractTitleFromNom'](undefined as any)).toBe('');
    });

    it('should preserve other text with "située" not followed by "à"', () => {
      const nom = 'Une propriété bien située avec vue';
      const result = service['extractTitleFromNom'](nom);

      expect(result).toBe('Une propriété bien située avec vue');
    });
  });

  describe('extractAuctionDate', () => {
    it('should extract from fermeture_reelle_date (priority 1)', () => {
      const lotData = {
        fermeture_reelle_date: 1762970400,
        encheres_fermeture_date: 1762970500,
        fermeture_date: 1762970600,
      };

      const result = service['extractAuctionDate'](lotData);

      expect(result).toBe('2025-09-18T12:00:00.000Z');
    });

    it('should fall back to encheres_fermeture_date (priority 2)', () => {
      const lotData = {
        encheres_fermeture_date: 1762970400,
        fermeture_date: 1762970500,
      };

      const result = service['extractAuctionDate'](lotData);

      expect(result).toBe('2025-09-18T12:00:00.000Z');
    });

    it('should fall back to fermeture_date (priority 3)', () => {
      const lotData = {
        fermeture_date: 1762970400,
      };

      const result = service['extractAuctionDate'](lotData);

      expect(result).toBe('2025-09-18T12:00:00.000Z');
    });

    it('should return null when no date fields are present', () => {
      const lotData = {};

      const result = service['extractAuctionDate'](lotData);

      expect(result).toBeNull();
    });

    it('should handle null date values', () => {
      const lotData = {
        fermeture_reelle_date: null,
        encheres_fermeture_date: null,
        fermeture_date: 1762970400,
      };

      const result = service['extractAuctionDate'](lotData);

      expect(result).toBe('2025-09-18T12:00:00.000Z');
    });
  });

  describe('extractAdress', () => {
    const testUrl =
      'https://encheres-publiques.fr/immobilier/maisons/saint-malo-35/test_120706';
    const mockAllData = exampleAddressJson.props.pageProps.apolloState.data;

    it('should extract address from address object (strategy 1)', () => {
      const lotData = {
        adresse_physique: { __ref: 'Adresse:198825' },
        nom: 'Test property',
      };

      const result = service['extractAdress'](lotData, mockAllData, testUrl);

      expect(result).toEqual({
        address: '8 Rue Mahé de la Bourdonnais, 35400 Saint-Malo, France',
        city: 'Saint-Malo',
        department: 35,
        latitude: 48.651272,
        longitude: -2.0259,
      });
    });

    it('should extract address from adresse field when adresse_physique is null', () => {
      const lotData = {
        adresse_physique: null,
        adresse: { __ref: 'Adresse:198825' },
        nom: 'Test property',
      };

      const result = service['extractAdress'](lotData, mockAllData, testUrl);

      expect(result).toEqual({
        address: '8 Rue Mahé de la Bourdonnais, 35400 Saint-Malo, France',
        city: 'Saint-Malo',
        department: 35,
        latitude: 48.651272,
        longitude: -2.0259,
      });
    });

    it('should parse address from nom field (strategy 2)', () => {
      const lotData = {
        adresse_physique: null,
        adresse: null,
        nom: 'Une maison de 107 m² située à Oinville-Sous-Auneau',
      };

      const result = service['extractAdress'](lotData, mockAllData, testUrl);

      expect(result).toEqual({
        address: 'Oinville-Sous-Auneau',
        city: 'Oinville-Sous-Auneau',
        department: 28, // Eure-et-Loir
      });
    });

    it('should extract from URL as fallback (strategy 3)', () => {
      const lotData = {
        adresse_physique: null,
        adresse: null,
        nom: 'Une maison moderne',
      };

      const result = service['extractAdress'](lotData, mockAllData, testUrl);

      expect(result).toEqual({
        address: 'Saint-Malo',
        city: 'Saint-Malo',
        department: 35,
      });
    });

    it('should handle missing address reference gracefully', () => {
      const lotData = {
        adresse_physique: { __ref: 'Adresse:MISSING' },
        nom: 'Test property',
      };

      const result = service['extractAdress'](lotData, mockAllData, testUrl);

      expect(result).toEqual({
        address: 'Test property',
        city: 'Test property',
        department: 35, // From URL fallback
      });
    });

    it('should handle various nom parsing patterns', () => {
      const testCases = [
        {
          nom: 'Une maison située à Paris 12ème',
          expected: {
            address: 'Paris 12ème',
            city: 'Paris 12ème',
            department: 75,
          },
        },
        {
          nom: 'Appartement situé à Lyon, Rhône',
          expected: {
            address: 'Lyon, Rhône',
            city: 'Lyon, Rhône',
            department: 69,
          },
        },
        {
          nom: 'Villa située dans le Var',
          expected: { address: 'le Var', city: 'le Var', department: 83 },
        },
        {
          nom: 'Propriété située sur la commune de Marseille',
          expected: {
            address: 'la commune de Marseille',
            city: 'la commune de Marseille',
            department: 13,
          },
        },
      ];

      testCases.forEach(({ nom, expected }) => {
        const lotData = {
          adresse_physique: null,
          adresse: null,
          nom,
        };

        const result = service['extractAdress'](lotData, mockAllData, testUrl);
        expect(result).toEqual(expected);
      });
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedUrl = 'https://invalid-url';
      const lotData = {
        adresse_physique: null,
        adresse: null,
        nom: 'Une maison moderne',
      };

      const result = service['extractAdress'](
        lotData,
        mockAllData,
        malformedUrl
      );

      expect(result).toEqual({
        address: 'Une maison moderne',
        city: 'Une maison moderne',
        department: 0, // Default when URL parsing fails
      });
    });
  });
});
