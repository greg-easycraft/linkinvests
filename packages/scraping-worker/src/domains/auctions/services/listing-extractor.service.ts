import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'playwright';

import type { AuctionListing } from '../types';

@Injectable()
export class ListingExtractorService {
  private readonly logger = new Logger(ListingExtractorService.name);

  async extractListingUrls(page: Page): Promise<AuctionListing[]> {
    this.logger.debug('Extracting listing URLs from page');

    const listings = await page.evaluate((): Array<{ url: string }> => {
      const cards = Array.from(document.querySelectorAll('[class*="card"]'));
      const results: Array<{ url: string }> = [];

      for (const card of cards) {
        let url = '';

        // Try to find link
        if (card.tagName === 'A') {
          url = (card as HTMLAnchorElement).getAttribute('href') || '';
        } else {
          const linkElement = card.querySelector('a');
          url = linkElement?.getAttribute('href') || '';
        }

        // Only include auction/encheres URLs, not category pages
        if (url && url.includes('/encheres/') && !url.includes('/ventes/')) {
          results.push({ url });
        }
      }

      return results;
    });

    this.logger.log({ count: listings.length }, `Extracted ${listings.length} listing URLs`);
    return listings;
  }

  async hasNextPage(page: Page): Promise<boolean> {
    try {
      // Look for pagination - common patterns
      const hasNext = await page.evaluate((): boolean => {
        // Look for "next" button or link
        const nextButton = document.querySelector(
          'a[rel="next"], button:has-text("Suivant"), a:has-text("Suivant"), [class*="next"]:not([disabled])'
        );
        return !!nextButton;
      });

      return hasNext;
    } catch (error: unknown) {
      this.logger.debug('Error checking for next page, assuming no pagination');
      return false;
    }
  }

  async goToNextPage(page: Page): Promise<boolean> {
    try {
      this.logger.debug('Attempting to navigate to next page');

      // Try to click next button
      await page
        .locator('a[rel="next"], button:has-text("Suivant"), a:has-text("Suivant")')
        .first()
        .click({ timeout: 3000 });

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for content to load

      this.logger.debug('Successfully navigated to next page');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.debug({ error: errorMessage }, 'Could not navigate to next page');
      return false;
    }
  }

  async extractAllListingsWithPagination(page: Page, maxScrolls: number = 10): Promise<AuctionListing[]> {
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

    // Remove duplicates based on URL
    const uniqueListings = Array.from(
      new Map(allListings.map((listing) => [listing.url, listing])).values()
    );

    this.logger.log(
      { total: allListings.length, unique: uniqueListings.length, scrolls: scrollAttempts },
      `Extracted ${uniqueListings.length} unique listings after ${scrollAttempts} scrolls`
    );

    return uniqueListings;
  }
}
