import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'playwright';

import type { AuctionOpportunity } from '../types';
import { AiExtractionService } from './ai-extraction.service';
import { GeocodingService } from './geocoding.service';
import { AuctionExtraction } from '../schemas/auction-extraction.schema';

interface DetailScraperResult {
  success: boolean;
  opportunity?: AuctionOpportunity;
  error?: string;
}

@Injectable()
export class DetailScraperService {
  private readonly logger = new Logger(DetailScraperService.name);
  private readonly baseUrl = 'https://www.encheres-publiques.com';

  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly aiExtractionService: AiExtractionService
  ) {}

  async scrapeDetails(page: Page, url: string): Promise<DetailScraperResult> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    try {
      // Navigate to detail page
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {
        this.logger.debug('Load timeout on detail page, proceeding anyway');
      });

      // Extract all data from the page
      const data = await page.evaluate(
        (): {
          title: string;
          address: string;
          price: string | null;
          description: string | null;
        } => {
          // Title
          const titleElement = document.querySelector(
            'h1, [class*="title"], [class*="titre"]'
          );
          const title = titleElement?.textContent?.trim() || '';

          // Address
          const addressElement = document.querySelector(
            '[class*="address"], [class*="adresse"], [class*="location"]'
          );
          const address = addressElement?.textContent?.trim() || '';

          // Price
          const priceElement = document.querySelector(
            '[class*="prix"], [class*="price"], [class*="montant"]'
          );
          let price = priceElement?.textContent?.trim() || null;

          // If no price element, search for euro amounts in text
          if (!price) {
            const bodyText = document.body.textContent || '';
            const priceMatch = bodyText.match(/(\d+[\s.]?\d*)\s*€/);
            if (priceMatch) {
              price = priceMatch[0];
            }
          }

          // Description
          const descElement = document.querySelector(
            '[class*="description"], [class*="detail"], .content'
          );
          const description = descElement?.textContent?.trim() || null;

          return { title, address, price, description };
        }
      );

      // Parse location from URL (e.g., paris-75, lyon-69)
      const locationMatch = url.match(/\/([a-z-]+)-(\d{2,3})\//);
      const city = locationMatch?.[1]?.replace(/-/g, ' ') || '';
      const departmentCode = locationMatch?.[2] || '';

      // Parse price
      const parsedPrice = data.price ? this.parsePrice(data.price) : undefined;

      // Build full address for geocoding
      const fullAddress = data.address || `${city}, ${departmentCode}, France`;

      // Geocode the address
      const coordinates = await this.geocodingService.geocodeAddress(fullAddress);

      if (!coordinates) {
        this.logger.warn(
          { url, address: fullAddress },
          'Failed to geocode address'
        );
      }

      // Use AI to extract structured data from description
      let aiExtractedData: AuctionExtraction | null = null;
      if (data.description) {
        aiExtractedData = await this.aiExtractionService.extractAuctionData(
          data.description
        );
      }

      const opportunity: AuctionOpportunity = {
        label: data.title || `Bien immobilier à ${city}`,
        address: data.address || fullAddress,
        zipCode: parseInt(departmentCode + '000', 10) || 75000,
        department: parseInt(departmentCode, 10) || 75,
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        auctionDate: new Date().toISOString().split('T')[0] as string, // TODO: Extract real date
        extraData: {
          price: aiExtractedData?.price ?? parsedPrice ?? undefined,
          propertyType: aiExtractedData?.propertyType ?? undefined,
          description: aiExtractedData?.description ?? data.description?.substring(0, 200) ?? undefined,
          squareFootage: aiExtractedData?.squareFootage ?? undefined,
          auctionVenue: aiExtractedData?.auctionVenue ?? undefined,
        },
      };

      return { success: true, opportunity };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn({ url, error: errorMessage }, 'Failed to scrape detail page');
      return { success: false, error: errorMessage };
    }
  }

  async scrapeDetailsBatch(
    page: Page,
    urls: string[],
    batchSize: number = 10
  ): Promise<AuctionOpportunity[]> {
    const opportunities: AuctionOpportunity[] = [];
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      this.logger.log(
        { current: i + 1, total: urls.length },
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`
      );

      for (const url of batch) {
        // Rate limiting: 2-3 seconds between requests
        const delay = 2000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        const result = await this.scrapeDetails(page, url);

        if (result.success && result.opportunity) {
          opportunities.push(result.opportunity);
          processed++;
        } else {
          failed++;
        }
      }

      this.logger.log(
        { processed, failed, remaining: urls.length - i - batch.length },
        `Batch complete: ${processed} successful, ${failed} failed`
      );
    }

    this.logger.log(
      { total: opportunities.length, processed, failed },
      `Detail scraping complete: ${opportunities.length} opportunities extracted`
    );

    return opportunities;
  }

  private parsePrice(priceString: string): number | undefined {
    // Remove spaces and convert "20 000 €" to number
    const cleaned = priceString.replace(/\s/g, '').replace('€', '');
    const number = parseInt(cleaned, 10);
    return isNaN(number) ? undefined : number;
  }
}
