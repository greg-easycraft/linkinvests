import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'playwright';

@Injectable()
export class ListingExtractorService {
  private readonly logger = new Logger(ListingExtractorService.name);

  async extractListingUrls(page: Page): Promise<string[]> {
    this.logger.debug('Extracting listing URLs from page');

    const links = await page.evaluate((): Array<string> => {
      const links = Array.from(document.querySelectorAll('a'));

      return links.map((link) => link.href);
    });
    this.logger.log({ links: links.length }, `Extracted ${links.length} links`);

    const filteredLinks = links.filter((link) =>
      link.includes('/encheres/immobilier/')
    );
    const relevantLinksSet = new Set<string>(filteredLinks);

    const results: Array<string> = Array.from(relevantLinksSet);
    this.logger.log(
      { count: results.length },
      `Extracted ${results.length} listing URLs`
    );
    return results;
  }

  async extractAllListingsWithPagination(
    page: Page,
    maxScrolls: number = 200
  ): Promise<string[]> {
    this.logger.log({ maxScrolls }, 'Starting extraction with lazy loading');

    let previousCount = 0;
    let scrollAttempts = 0;
    let noNewContentCount = 0;

    // Scroll down multiple times to trigger lazy loading
    while (scrollAttempts < maxScrolls) {
      // Extract current listings count
      const currentListings = await this.extractListingUrls(page);
      const currentCount = currentListings.length;

      this.logger.log(
        { attempt: scrollAttempts + 1, listings: currentCount },
        `Scroll attempt ${scrollAttempts + 1}: ${currentCount} listings`
      );

      // Check if we got new content
      if (currentCount === previousCount) {
        noNewContentCount++;
        this.logger.debug({ noNewContentCount }, 'No new content loaded');

        // If no new content after 2 attempts, stop scrolling
        if (noNewContentCount >= 2) {
          this.logger.log('No new content after multiple attempts, stopping');
          break;
        }
      } else {
        noNewContentCount = 0; // Reset counter if we got new content
      }

      previousCount = currentCount;

      // Scroll to bottom of page
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait for content to load (2-3 seconds)
      const waitTime = 2000 + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      scrollAttempts++;
    }

    // Final extraction after all scrolling
    const allListings = await this.extractListingUrls(page);

    this.logger.log(
      {
        total: allListings.length,
        scrolls: scrollAttempts,
      },
      `Extracted ${allListings.length} listings after ${scrollAttempts} scrolls`
    );

    return allListings;
  }
}
