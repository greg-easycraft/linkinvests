import { Injectable, Logger } from '@nestjs/common';

import type { AuctionOpportunity } from '../types';
import { BrowserService } from './browser.service';
import { DetailScraperService } from './detail-scraper.service';
import { ListingExtractorService } from './listing-extractor.service';

@Injectable()
export class EncheresPubliquesScraperService {
  private readonly logger = new Logger(EncheresPubliquesScraperService.name);
  private readonly baseUrl =
    'https://www.encheres-publiques.com/encheres/immobilier?evenements_periode=en_cours_a_venir';

  constructor(
    private readonly browserService: BrowserService,
    private readonly listingExtractor: ListingExtractorService,
    private readonly detailScraper: DetailScraperService
  ) {}

  async scrapeAuctions(): Promise<AuctionOpportunity[]> {
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
        await this.listingExtractor.extractAllListingsWithPagination(
          page,
          50 // Max 50 scroll attempts (smart stopping after 2 empty scrolls)
        );

      if (listingUrls.length === 0) {
        this.logger.error('No listings found');
        return [];
      }

      this.logger.log(
        { total: listingUrls.length },
        `Found ${listingUrls.length} listings to process`
      );

      // Scrape details for each listing (in batches of 10)
      const opportunities = await this.detailScraper.scrapeDetailsBatch(
        this.browserService,
        listingUrls,
        10
      );

      this.logger.log({ total: opportunities.length }, 'Scraping complete');

      return opportunities;
    } finally {
      // Always close browser
      await this.browserService.close();
    }
  }
}
