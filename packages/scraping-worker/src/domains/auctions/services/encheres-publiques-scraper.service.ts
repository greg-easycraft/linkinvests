import { Injectable, Logger } from '@nestjs/common';

import { DEPARTMENT_NAMES } from '../constants/departments';
import type { AuctionOpportunity } from '../types';
import { BrowserService } from './browser.service';
import { DetailScraperService } from './detail-scraper.service';
import { ListingExtractorService } from './listing-extractor.service';

@Injectable()
export class EncheresPubliquesScraperService {
  private readonly logger = new Logger(EncheresPubliquesScraperService.name);
  private readonly baseUrl = 'https://www.encheres-publiques.com/evenements/immobilier';

  constructor(
    private readonly browserService: BrowserService,
    private readonly listingExtractor: ListingExtractorService,
    private readonly detailScraper: DetailScraperService
  ) {}

  async scrapeAuctions(
    departmentId?: number,
    sinceDate?: string
  ): Promise<AuctionOpportunity[]> {
    this.logger.log(
      { departmentId, sinceDate },
      'Starting auction scraping process'
    );

    try {
      // Initialize browser
      await this.browserService.initialize();

      // Build URL with department filter if provided
      const url = this.buildUrl(departmentId);
      this.logger.log({ url }, 'Navigating to listings page');

      // Navigate to listings page
      await this.browserService.navigateToUrl(url);

      // Handle cookie consent
      await this.browserService.handleCookieConsent();

      // Wait for content to load
      await this.browserService.waitForContent();

      // Extract all listing URLs with lazy loading (scroll-based)
      const page = this.browserService.getPage();
      const listings = await this.listingExtractor.extractAllListingsWithPagination(
        page,
        50 // Max 50 scroll attempts (smart stopping after 2 empty scrolls)
      );

      if (listings.length === 0) {
        this.logger.warn('No listings found');
        return [];
      }

      this.logger.log(
        { total: listings.length },
        `Found ${listings.length} listings to process`
      );

      // Scrape details for each listing (in batches of 10)
      const urls = listings.map((listing) => listing.url);
      const opportunities = await this.detailScraper.scrapeDetailsBatch(
        page,
        urls,
        10
      );

      this.logger.log(
        { total: opportunities.length },
        'Scraping complete'
      );

      return opportunities;
    } finally {
      // Always close browser
      await this.browserService.close();
    }
  }

  private buildUrl(departmentId?: number): string {
    if (!departmentId) {
      // No department filter - return base URL for all of France
      return `${this.baseUrl}?evenements_periode=en_cours_a_venir`;
    }

    const departmentName = DEPARTMENT_NAMES[departmentId];
    if (!departmentName) {
      this.logger.warn(
        { departmentId },
        'Unknown department ID, using base URL without filter'
      );
      return `${this.baseUrl}?evenements_periode=en_cours_a_venir`;
    }

    return `${this.baseUrl}?place=${departmentName}&evenements_periode=en_cours_a_venir`;
  }
}
