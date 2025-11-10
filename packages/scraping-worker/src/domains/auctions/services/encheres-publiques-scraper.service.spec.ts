/* eslint-disable @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { EncheresPubliquesScraperService } from './encheres-publiques-scraper.service';
import { BrowserService } from './browser.service';
import { ListingExtractorService } from './listing-extractor.service';
import { DetailScraperService } from './detail-scraper.service';
import { AuctionsGeocodingService } from './geocoding.service';
import type { Page } from 'playwright';
import type { RawAuctionOpportunity, AuctionOpportunity } from '../types';

describe('EncheresPubliquesScraperService', () => {
  let service: EncheresPubliquesScraperService;
  let mockPage: jest.Mocked<Page>;

  const mockBrowserService = {
    initialize: jest.fn(),
    navigateToUrl: jest.fn(),
    handleCookieConsent: jest.fn(),
    getPage: jest.fn(),
    close: jest.fn(),
  };

  const mockListingExtractorService = {
    extractAllListingsWithPagination: jest.fn(),
  };

  const mockDetailScraperService = {
    scrapeDetailsBatch: jest.fn(),
  };

  const mockGeocodingService = {
    geocodeBatch: jest.fn(),
  };

  const mockRawOpportunities: RawAuctionOpportunity[] = [
    {
      url: 'https://encheres-publiques.fr/lot/test-1',
      label: 'Test Property 1',
      address: '1 Rue de la Paix, Paris',
      city: 'Paris',
      department: '75',
      latitude: 48.8566,
      longitude: 2.3522,
      auctionDate: '2025-01-15T14:00:00.000Z',
      extraData: { url: 'https://encheres-publiques.fr/lot/test-1' },
    },
    {
      url: 'https://encheres-publiques.fr/lot/test-2',
      label: 'Test Property 2',
      address: '2 Avenue des Champs-Élysées, Paris',
      city: 'Paris',
      department: '75',
      latitude: 48.8738,
      longitude: 2.295,
      auctionDate: '2025-01-20T15:30:00.000Z',
      extraData: { url: 'https://encheres-publiques.fr/lot/test-2' },
    },
  ];

  const mockEnrichedOpportunities: AuctionOpportunity[] = [
    {
      ...mockRawOpportunities[0],
      zipCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
    },
    {
      ...mockRawOpportunities[1],
      zipCode: '75008',
      latitude: 48.8698,
      longitude: 2.3075,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncheresPubliquesScraperService,
        { provide: BrowserService, useValue: mockBrowserService },
        {
          provide: ListingExtractorService,
          useValue: mockListingExtractorService,
        },
        { provide: DetailScraperService, useValue: mockDetailScraperService },
        { provide: AuctionsGeocodingService, useValue: mockGeocodingService },
      ],
    }).compile();

    service = module.get<EncheresPubliquesScraperService>(
      EncheresPubliquesScraperService
    );

    // Mock page object
    mockPage = {
      goto: jest.fn(),
      waitForLoadState: jest.fn(),
    } as any;

    mockBrowserService.getPage.mockReturnValue(mockPage);

    // Suppress logger
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('scrapeAuctions', () => {
    const mockListingUrls = [
      'https://encheres-publiques.fr/lot/test-1',
      'https://encheres-publiques.fr/lot/test-2',
    ];

    beforeEach(() => {
      // Setup default successful mocks
      mockBrowserService.initialize.mockResolvedValue(undefined);
      mockBrowserService.navigateToUrl.mockResolvedValue(undefined);
      mockBrowserService.handleCookieConsent.mockResolvedValue(undefined);
      mockListingExtractorService.extractAllListingsWithPagination.mockResolvedValue(
        mockListingUrls
      );
      mockDetailScraperService.scrapeDetailsBatch.mockResolvedValue(
        mockRawOpportunities
      );
      mockGeocodingService.geocodeBatch.mockResolvedValue(
        mockEnrichedOpportunities
      );
      mockBrowserService.close.mockResolvedValue(undefined);
    });

    it('should complete full scraping workflow successfully', async () => {
      const result = await service.scrapeAuctions();

      expect(result).toEqual(mockEnrichedOpportunities);

      // Verify workflow order
      expect(mockBrowserService.initialize).toHaveBeenCalledTimes(1);
      expect(mockBrowserService.navigateToUrl).toHaveBeenCalledWith(
        'https://encheres-publiques.fr/encheres/immobilier?size=48&page=0&sort=end_at%2Casc'
      );
      expect(mockBrowserService.handleCookieConsent).toHaveBeenCalledTimes(1);
      expect(
        mockListingExtractorService.extractAllListingsWithPagination
      ).toHaveBeenCalledWith(mockPage, 50);
      expect(mockDetailScraperService.scrapeDetailsBatch).toHaveBeenCalledWith(
        mockListingUrls,
        5
      );
      expect(mockGeocodingService.geocodeBatch).toHaveBeenCalledWith(
        mockRawOpportunities
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should log progress throughout the workflow', async () => {
      await service.scrapeAuctions();

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Starting auction scraping...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Initializing browser...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Navigating to listings page...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Handling cookie consent...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Extracting listing URLs...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        `Found ${mockListingUrls.length} listing URLs`
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Scraping details from listings...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        `Scraped ${mockRawOpportunities.length} opportunities`
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Geocoding addresses...'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        `Geocoded ${mockEnrichedOpportunities.length} opportunities`
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Auction scraping completed successfully'
      );
    });

    it('should handle browser initialization failure', async () => {
      const initError = new Error('Failed to launch browser');
      mockBrowserService.initialize.mockRejectedValue(initError);

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Failed to launch browser'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        initError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1); // Should still attempt cleanup
    });

    it('should handle navigation failure', async () => {
      const navError = new Error('Navigation timeout');
      mockBrowserService.navigateToUrl.mockRejectedValue(navError);

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Navigation timeout'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        navError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle cookie consent failure gracefully', async () => {
      const cookieError = new Error('Cookie consent failed');
      mockBrowserService.handleCookieConsent.mockRejectedValue(cookieError);

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Cookie consent failed'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        cookieError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle listing extraction failure', async () => {
      const extractionError = new Error('Failed to extract listings');
      mockListingExtractorService.extractAllListingsWithPagination.mockRejectedValue(
        extractionError
      );

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Failed to extract listings'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        extractionError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle detail scraping failure', async () => {
      const scrapingError = new Error('Failed to scrape details');
      mockDetailScraperService.scrapeDetailsBatch.mockRejectedValue(
        scrapingError
      );

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Failed to scrape details'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        scrapingError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle geocoding failure', async () => {
      const geocodingError = new Error('Geocoding service unavailable');
      mockGeocodingService.geocodeBatch.mockRejectedValue(geocodingError);

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Geocoding service unavailable'
      );

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to scrape auctions:',
        geocodingError
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle empty listing URLs', async () => {
      mockListingExtractorService.extractAllListingsWithPagination.mockResolvedValue(
        []
      );

      const result = await service.scrapeAuctions();

      expect(result).toEqual([]);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Found 0 listing URLs'
      );
      expect(mockDetailScraperService.scrapeDetailsBatch).toHaveBeenCalledWith(
        [],
        5
      );
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle empty scraping results', async () => {
      mockDetailScraperService.scrapeDetailsBatch.mockResolvedValue([]);

      const result = await service.scrapeAuctions();

      expect(result).toEqual([]);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Scraped 0 opportunities'
      );
      expect(mockGeocodingService.geocodeBatch).toHaveBeenCalledWith([]);
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle partial geocoding results', async () => {
      const partiallyGeocodedOpportunities: AuctionOpportunity[] = [
        {
          ...mockRawOpportunities[0],
          zipCode: '75001',
          latitude: 48.8566,
          longitude: 2.3522,
        },
        // Second opportunity failed geocoding
        {
          ...mockRawOpportunities[1],
          zipCode: '75008',
        } as AuctionOpportunity,
      ];

      mockGeocodingService.geocodeBatch.mockResolvedValue(
        partiallyGeocodedOpportunities
      );

      const result = await service.scrapeAuctions();

      expect(result).toEqual(partiallyGeocodedOpportunities);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Geocoded 2 opportunities'
      );
    });

    it('should ensure browser cleanup even when errors occur', async () => {
      const error = new Error('Random error during workflow');
      mockListingExtractorService.extractAllListingsWithPagination.mockRejectedValue(
        error
      );

      await expect(service.scrapeAuctions()).rejects.toThrow(
        'Random error during workflow'
      );

      // Browser close should be called in finally block
      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle browser close failure during cleanup', async () => {
      const closeError = new Error('Failed to close browser');
      mockBrowserService.close.mockRejectedValue(closeError);

      // Main workflow should still complete successfully
      const result = await service.scrapeAuctions();

      expect(result).toEqual(mockEnrichedOpportunities);
      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to close browser:',
        closeError
      );
    });

    it('should handle workflow with large number of listings', async () => {
      const largeListing = Array(1000)
        .fill(null)
        .map((_, index) => `https://encheres-publiques.fr/lot/test-${index}`);
      const largeRawOpportunities: RawAuctionOpportunity[] = largeListing.map(
        (url, index) => ({
          url,
          label: `Property ${index}`,
          address: `Address ${index}`,
          city: 'Paris',
          department: '75',
          latitude: 48.8566,
          longitude: 2.3522,
          auctionDate: '2025-01-15T14:00:00.000Z',
          extraData: { url },
        })
      );
      const largeEnrichedOpportunities: AuctionOpportunity[] =
        largeRawOpportunities.map((opp) => ({
          ...opp,
          zipCode: '75001',
          latitude: 48.8566,
          longitude: 2.3522,
        }));

      mockListingExtractorService.extractAllListingsWithPagination.mockResolvedValue(
        largeListing
      );
      mockDetailScraperService.scrapeDetailsBatch.mockResolvedValue(
        largeRawOpportunities
      );
      mockGeocodingService.geocodeBatch.mockResolvedValue(
        largeEnrichedOpportunities
      );

      const result = await service.scrapeAuctions();

      expect(result).toHaveLength(1000);
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Found 1000 listing URLs'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Scraped 1000 opportunities'
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Geocoded 1000 opportunities'
      );
    });

    it('should pass correct parameters to services', async () => {
      await service.scrapeAuctions();

      // Verify correct URL is used
      expect(mockBrowserService.navigateToUrl).toHaveBeenCalledWith(
        'https://encheres-publiques.fr/encheres/immobilier?size=48&page=0&sort=end_at%2Casc'
      );

      // Verify correct pagination limit
      expect(
        mockListingExtractorService.extractAllListingsWithPagination
      ).toHaveBeenCalledWith(mockPage, 50);

      // Verify correct batch size for detail scraping
      expect(mockDetailScraperService.scrapeDetailsBatch).toHaveBeenCalledWith(
        mockListingUrls,
        5
      );
    });

    it('should maintain data flow integrity between services', async () => {
      await service.scrapeAuctions();

      // Verify data flows correctly between services
      const detailScraperCall =
        mockDetailScraperService.scrapeDetailsBatch.mock.calls[0];
      const geocodingCall = mockGeocodingService.geocodeBatch.mock.calls[0];

      expect(detailScraperCall[0]).toEqual(mockListingUrls); // URLs from extractor
      expect(geocodingCall[0]).toEqual(mockRawOpportunities); // Raw opportunities from detail scraper
    });

    it('should handle null/undefined results from services gracefully', async () => {
      mockListingExtractorService.extractAllListingsWithPagination.mockResolvedValue(
        null as any
      );
      mockDetailScraperService.scrapeDetailsBatch.mockResolvedValue(
        null as any
      );
      mockGeocodingService.geocodeBatch.mockResolvedValue(null as any);

      await expect(service.scrapeAuctions()).rejects.toThrow();

      expect(mockBrowserService.close).toHaveBeenCalledTimes(1);
    });

    it('should handle service method calls with correct timing', async () => {
      const callOrder: string[] = [];

      mockBrowserService.initialize.mockImplementation(async () => {
        callOrder.push('initialize');
      });
      mockBrowserService.navigateToUrl.mockImplementation(async () => {
        callOrder.push('navigate');
      });
      mockBrowserService.handleCookieConsent.mockImplementation(async () => {
        callOrder.push('cookies');
      });
      mockListingExtractorService.extractAllListingsWithPagination.mockImplementation(
        async () => {
          callOrder.push('extract');
          return mockListingUrls;
        }
      );
      mockDetailScraperService.scrapeDetailsBatch.mockImplementation(
        async () => {
          callOrder.push('scrape');
          return mockRawOpportunities;
        }
      );
      mockGeocodingService.geocodeBatch.mockImplementation(async () => {
        callOrder.push('geocode');
        return mockEnrichedOpportunities;
      });
      mockBrowserService.close.mockImplementation(async () => {
        callOrder.push('close');
      });

      await service.scrapeAuctions();

      expect(callOrder).toEqual([
        'initialize',
        'navigate',
        'cookies',
        'extract',
        'scrape',
        'geocode',
        'close',
      ]);
    });
  });
});
