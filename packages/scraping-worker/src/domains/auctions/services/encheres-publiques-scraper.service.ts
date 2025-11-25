import { Injectable, Logger } from '@nestjs/common';

import type { RawAuctionInput } from '../types';
import { BrowserService } from './browser.service';
import { DetailScraperService } from './detail-scraper.service';
import { ListingExtractorService } from './listing-extractor.service';
import { AuctionsGeocodingService } from './geocoding.service';
import { AIAddressService } from './ai-address.service';
import { AuctionInput } from '@linkinvests/shared';

@Injectable()
export class EncheresPubliquesScraperService {
  private readonly logger = new Logger(EncheresPubliquesScraperService.name);
  private readonly baseUrl =
    'https://www.encheres-publiques.com/encheres/immobilier?evenements_periode=en_cours_a_venir';

  constructor(
    private readonly browserService: BrowserService,
    private readonly listingExtractor: ListingExtractorService,
    private readonly detailScraper: DetailScraperService,
    private readonly aiAddressService: AIAddressService,
    private readonly geocodingService: AuctionsGeocodingService
  ) {}

  async scrapeAuctions(externalIds: Set<string>): Promise<AuctionInput[]> {
    this.logger.log('Starting auction scraping process');

    try {
      // Initialize browser
      await this.browserService.initialize();

      // Build URL with department filter if provided
      this.logger.log({ url: this.baseUrl }, 'Navigating to listings page');

      // Navigate to listings page
      await this.browserService.navigateToUrl(this.baseUrl);

      // Handle cookie consent
      await this.browserService.handleCookieConsent();

      // Wait for content to load
      await this.browserService.waitForContent();

      // Extract all listing URLs with lazy loading (scroll-based)
      const page = this.browserService.getPage();

      const listingUrls =
        await this.listingExtractor.extractAllListingsWithPagination(page);

      if (listingUrls.length === 0) {
        this.logger.error('No listings found');
        return [];
      }

      this.logger.log(
        { total: listingUrls.length },
        `Found ${listingUrls.length} listings to process`
      );

      // Scrape details for each listing (in batches of 10)
      const scrapedAuctions = await this.detailScraper.scrapeDetailsBatch(
        listingUrls,
        10
      );

      const { auctionsToUpdate, auctionsToCreate } = scrapedAuctions.reduce<{
        auctionsToUpdate: RawAuctionInput[];
        auctionsToCreate: RawAuctionInput[];
      }>(
        (acc, auction) => {
          if (externalIds.has(auction.externalId)) {
            acc.auctionsToUpdate.push(auction);
            return acc;
          }
          acc.auctionsToCreate.push(auction);
          return acc;
        },
        { auctionsToUpdate: [], auctionsToCreate: [] }
      );

      this.logger.log({ total: scrapedAuctions.length }, 'Scraping complete');

      const standardizedAuctions =
        await this.aiAddressService.standardizeBatch(auctionsToCreate);

      const geocodedAuctions =
        await this.geocodingService.geocodeBatch(standardizedAuctions);

      const allAuctions: AuctionInput[] = [
        ...geocodedAuctions,
        ...auctionsToUpdate.map((auction) => ({
          ...auction,
          latitude: 0,
          longitude: 0,
          zipCode: '00000',
        })),
      ];

      return allAuctions;
    } finally {
      // Always close browser
      await this.browserService.close();
    }
  }
}
