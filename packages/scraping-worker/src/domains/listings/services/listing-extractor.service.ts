import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service.js';
import type {
  ListingExtractionResult,
  ListingScrapingConfig,
} from '~/domains/listings/types/listings.types.js';
import { Page } from 'playwright';

@Injectable()
export class ListingExtractorService {
  private readonly logger = new Logger(ListingExtractorService.name);

  constructor(private readonly browserService: BrowserService) {}

  async extractAllListingUrls(
    config: ListingScrapingConfig,
    startPage: number = 1
  ): Promise<string[]> {
    const allUrls = new Set<string>();
    let currentPage = startPage;
    let hasMorePages = true;

    this.logger.log(`Starting listing URL extraction from page ${startPage}`);

    try {
      while (
        hasMorePages &&
        (!config.maxPages || currentPage <= config.maxPages)
      ) {
        this.logger.log({ currentPage }, 'Processing page');

        const pageUrl = this.buildPageUrl(config.baseUrl, currentPage);
        await this.browserService.navigateToUrl(pageUrl);
        await this.browserService.waitForContent(10000);

        // Handle cookie consent on first page of the scraping session
        if (currentPage === startPage) {
          await this.browserService.handleTarteaucitronCookieConsent();
          await this.browserService.waitForContent(3000);
        }

        const extractionResult = await this.extractListingsFromCurrentPage();

        // Add new URLs to our set
        const initialCount = allUrls.size;
        extractionResult.urls.forEach((url) => allUrls.add(url));
        const newUrlsFound = allUrls.size - initialCount;

        this.logger.log(
          {
            currentPage,
            urlsOnPage: extractionResult.urls.length,
            newUrlsFound,
            totalUrlsCollected: allUrls.size,
          },
          'Page processed'
        );

        // Check if we should continue
        hasMorePages = extractionResult.pageInfo.hasNextPage;

        // If no new URLs found for 2 consecutive pages, stop
        if (newUrlsFound === 0 && currentPage > startPage) {
          this.logger.log('No new URLs found, likely reached the end');
          break;
        }

        currentPage++;

        // Delay between pages to be respectful
        if (hasMorePages && config.delayBetweenPages) {
          await this.browserService.delay(config.delayBetweenPages);
        }
      }

      const finalUrls = Array.from(allUrls);
      this.logger.log(
        {
          startPage,
          endPage: currentPage - 1,
          totalPages: currentPage - startPage,
          totalUrls: finalUrls.length,
        },
        'Listing URL extraction completed'
      );

      return finalUrls;
    } catch (error: unknown) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          currentPage,
          totalUrlsCollected: allUrls.size,
        },
        'Error during listing extraction'
      );

      // Return what we managed to collect
      return Array.from(allUrls);
    }
  }

  private async extractListingsFromCurrentPage(): Promise<ListingExtractionResult> {
    const page = this.browserService.getPage();
    const extractedAt = new Date();
    try {
      await page.waitForSelector('.container_detail', {
        timeout: 10000,
      });
      let listingLinks: string[] = [];

      try {
        const selector = 'a[href*="immobilier.notaires.fr/fr/annonce"]';
        const listingUrlRegex = /immobilier\.notaires\.fr\/fr\/annonce.*\/\d+$/;

        const allLinks = await page.$$eval(selector, (elements) =>
          elements
            .map((el) => (el as HTMLAnchorElement).href)
            .filter(
              (href) =>
                href &&
                (href.includes('/annonce') ||
                  href.includes('/bien') ||
                  href.includes('/property'))
            )
        );
        listingLinks = allLinks.filter((href) => listingUrlRegex.test(href));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (genericError: unknown) {
        this.logger.warn('Could not find any listing links');
      }

      return {
        urls: listingLinks,
        pageInfo: {
          currentPage: 1,
          hasNextPage: await this.hasNextPage(page),
        },
        extractedAt,
      };
    } catch (error: unknown) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error extracting listings from current page'
      );

      return {
        urls: [],
        pageInfo: {
          currentPage: 1,
          hasNextPage: false,
        },
        extractedAt,
      };
    }
  }

  private async hasNextPage(page: Page): Promise<boolean> {
    try {
      const nextButton = page.locator('.pagination-next');
      if (!nextButton) {
        return false;
      }
      const classList = await nextButton.getAttribute('class');
      return !(classList && classList.includes('disabled'));
    } catch (error: unknown) {
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error extracting pagination info'
      );
      return false;
    }
  }

  private buildPageUrl(baseUrl: string, page: number): string {
    const url = new URL(baseUrl);
    url.searchParams.set('page', page.toString());
    return url.toString();
  }
}
