import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service.js';
import type { RawListingOpportunity } from '~/domains/listings/types/listings.types.js';
import { Page } from 'playwright';

@Injectable()
export class DetailScraperService {
  private readonly logger = new Logger(DetailScraperService.name);

  constructor(private readonly browserService: BrowserService) {}

  async scrapeListingDetails(urls: string[]): Promise<RawListingOpportunity[]> {
    const listings: RawListingOpportunity[] = [];
    let successCount = 0;
    let errorCount = 0;

    this.logger.log({ totalUrls: urls.length }, 'Starting detail scraping');

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      try {
        this.logger.debug(
          { url, progress: `${i + 1}/${urls.length}` },
          'Scraping listing detail'
        );

        const listing = await this.scrapeIndividualListing(url);
        if (listing) {
          listings.push(listing);
          successCount++;
        }

        // Rate limiting: delay between requests
        if (i < urls.length - 1) {
          await this.browserService.delay(2000 + Math.random() * 1000); // 2-3 seconds
        }
      } catch (error: unknown) {
        errorCount++;
        this.logger.warn(
          {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
            progress: `${i + 1}/${urls.length}`,
          },
          'Failed to scrape listing detail'
        );

        // Continue with next listing
        continue;
      }

      // Log progress every 10 listings
      if ((i + 1) % 10 === 0) {
        this.logger.log(
          {
            processed: i + 1,
            total: urls.length,
            success: successCount,
            errors: errorCount,
            progressPercent: Math.round(((i + 1) / urls.length) * 100),
          },
          'Detail scraping progress'
        );
      }
    }

    this.logger.log(
      {
        totalProcessed: urls.length,
        successful: successCount,
        errors: errorCount,
        successRate: Math.round((successCount / urls.length) * 100),
      },
      'Detail scraping completed'
    );

    return listings;
  }

  private async scrapeIndividualListing(
    url: string
  ): Promise<RawListingOpportunity | null> {
    try {
      // Navigate to the listing page
      await this.browserService.navigateToUrl(url);
      await this.browserService.waitForContent(8000);

      const page = this.browserService.getPage();

      // Extract basic information
      const listing: Partial<RawListingOpportunity> = {
        url,
        opportunityDate: new Date().toISOString().split('T')[0], // Default to today
        externalId: this.extractExternalIdFromUrl(url),
      };

      // Extract title/label
      const titleSelectors = [
        'h1',
        '[data-testid="listing-title"]',
        '.listing-title',
        '.property-title',
        '.bien-titre',
      ];

      for (const selector of titleSelectors) {
        try {
          const title = await page.$eval(selector, (el) =>
            el.textContent?.trim()
          );
          if (title) {
            listing.label = title;
            break;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
          continue;
        }
      }

      // Extract price
      const priceSelectors = [
        '[data-testid="price"]',
        '.price',
        '.prix',
        '.price-value',
        '.montant',
      ];

      for (const selector of priceSelectors) {
        try {
          const priceText = await page.$eval(selector, (el) =>
            el.textContent?.trim()
          );
          if (priceText) {
            const price = this.extractPriceFromText(priceText);
            if (price) {
              listing.price = price.amount;
              listing.priceType = price.type;
              break;
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
          continue;
        }
      }

      // Extract description
      const descriptionSelectors = [
        '[data-testid="description"]',
        '.description',
        '.bien-description',
        '.property-description',
        '.descriptif',
      ];

      for (const selector of descriptionSelectors) {
        try {
          const description = await page.$eval(selector, (el) =>
            el.textContent?.trim()
          );
          if (description && description.length > 20) {
            listing.description = description;
            break;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
          continue;
        }
      }

      // Extract property details from various sources
      await this.extractPropertyDetails(page, listing);

      // Extract address and location
      await this.extractAddressInfo(page, listing);

      // Extract images
      listing.images = await this.extractImages(page);

      // Extract notary contact information
      listing.notaryOffice = await this.extractNotaryContact(page);

      // Validate required fields
      if (!listing.label || !listing.address) {
        this.logger.debug({ url }, 'Missing required fields, skipping listing');
        return null;
      }

      // Set defaults for missing required fields
      listing.department =
        listing.department ||
        this.extractDepartmentFromAddress(listing.address || '');
      listing.city =
        listing.city || this.extractCityFromAddress(listing.address || '');

      return listing as RawListingOpportunity;
    } catch (error: unknown) {
      this.logger.error(
        {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Error scraping individual listing'
      );

      return null;
    }
  }

  private async extractPropertyDetails(
    page: Page,
    listing: Partial<RawListingOpportunity>
  ): Promise<void> {
    // Try to extract property details from structured data or description lists
    const detailSelectors = [
      '.property-details',
      '.characteristics',
      '.caracteristiques',
      '.details-list',
      '.bien-details',
    ];

    for (const containerSelector of detailSelectors) {
      try {
        const container = await page.$(containerSelector);
        if (!container) continue;

        // Extract key-value pairs
        const details = await container.$$eval(
          'dt, dd, .detail-item, .characteristic',
          (elements) => {
            const pairs: { key: string; value: string }[] = [];

            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const text = el.textContent?.trim() || '';

              if (el.tagName === 'DT' && i + 1 < elements.length) {
                const nextEl = elements[i + 1];
                if (nextEl.tagName === 'DD') {
                  pairs.push({
                    key: text.toLowerCase(),
                    value: nextEl.textContent?.trim() || '',
                  });
                }
              } else if (text.includes(':')) {
                const [key, ...valueParts] = text.split(':');
                pairs.push({
                  key: key.trim().toLowerCase(),
                  value: valueParts.join(':').trim(),
                });
              }
            }

            return pairs;
          }
        );

        // Map extracted details to listing fields
        for (const detail of details) {
          this.mapDetailToListing(detail.key, detail.value, listing);
        }

        break; // Found details, stop searching
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        continue;
      }
    }

    // Also try to extract from meta tags or JSON-LD
    try {
      const jsonLd = await page.$eval(
        'script[type="application/ld+json"]',
        (el) => JSON.parse(el.textContent || '{}')
      );

      if (jsonLd) {
        this.mapJsonLdToListing(jsonLd, listing);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      // No JSON-LD found
    }
  }

  private mapDetailToListing(
    key: string,
    value: string,
    listing: Partial<RawListingOpportunity>
  ): void {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes('surface') ||
      lowerKey.includes('m²') ||
      lowerKey.includes('superficie')
    ) {
      const surface = this.extractNumberFromText(value);
      if (surface) listing.squareFootage = surface;
    } else if (lowerKey.includes('terrain') || lowerKey.includes('parcelle')) {
      const landArea = this.extractNumberFromText(value);
      if (landArea) listing.landArea = landArea;
    } else if (lowerKey.includes('pièce') || lowerKey.includes('room')) {
      const rooms = this.extractNumberFromText(value);
      if (rooms) listing.rooms = rooms;
    } else if (lowerKey.includes('chambre') || lowerKey.includes('bedroom')) {
      const bedrooms = this.extractNumberFromText(value);
      if (bedrooms) listing.bedrooms = bedrooms;
    } else if (lowerKey.includes('dpe') || lowerKey.includes('énerg')) {
      listing.dpe = value.charAt(0).toUpperCase();
    } else if (lowerKey.includes('étage') || lowerKey.includes('floor')) {
      const floor = this.extractNumberFromText(value);
      if (floor !== null) listing.floor = floor;
    } else if (
      lowerKey.includes('construction') ||
      lowerKey.includes('année')
    ) {
      const year = this.extractNumberFromText(value);
      if (year && year > 1800 && year <= new Date().getFullYear()) {
        listing.constructionYear = year;
      }
    } else if (lowerKey.includes('balcon')) {
      listing.balcony = this.extractBooleanFromText(value);
    } else if (lowerKey.includes('terrasse')) {
      listing.terrace = this.extractBooleanFromText(value);
    } else if (lowerKey.includes('jardin')) {
      listing.garden = this.extractBooleanFromText(value);
    } else if (lowerKey.includes('garage')) {
      listing.garage = this.extractBooleanFromText(value);
    } else if (lowerKey.includes('parking')) {
      listing.parking = this.extractBooleanFromText(value);
    } else if (
      lowerKey.includes('ascenseur') ||
      lowerKey.includes('elevator')
    ) {
      listing.elevator = this.extractBooleanFromText(value);
    }
  }

  private mapJsonLdToListing(
    jsonLd: any,
    listing: Partial<RawListingOpportunity>
  ): void {
    if (
      jsonLd['@type'] === 'RealEstateListing' ||
      jsonLd['@type'] === 'Product'
    ) {
      if (jsonLd.name && !listing.label) {
        listing.label = jsonLd.name;
      }

      if (jsonLd.description && !listing.description) {
        listing.description = jsonLd.description;
      }

      if (jsonLd.offers?.price && !listing.price) {
        listing.price = parseFloat(jsonLd.offers.price);
      }

      if (jsonLd.address) {
        const address = jsonLd.address;
        if (address.streetAddress && !listing.address) {
          listing.address = `${address.streetAddress}, ${address.addressLocality}`;
        }
        if (address.addressLocality && !listing.city) {
          listing.city = address.addressLocality;
        }
      }

      // Extract property features
      if (jsonLd.numberOfRooms && !listing.rooms) {
        listing.rooms = parseInt(jsonLd.numberOfRooms);
      }

      if (jsonLd.floorSize && !listing.squareFootage) {
        listing.squareFootage = parseFloat(
          jsonLd.floorSize.value || jsonLd.floorSize
        );
      }
    }
  }

  private async extractAddressInfo(
    page: Page,
    listing: Partial<RawListingOpportunity>
  ): Promise<void> {
    const addressSelectors = [
      '[data-testid="address"]',
      '.address',
      '.adresse',
      '.location',
      '.localisation',
    ];

    for (const selector of addressSelectors) {
      try {
        const addressText = await page.$eval(selector, (el) =>
          el.textContent?.trim()
        );
        if (addressText) {
          listing.address = addressText;

          // Try to extract city and department
          const cityMatch = addressText.match(/(\d{5})\s+([^,]+)/);
          if (cityMatch) {
            const zipCode = cityMatch[1];
            listing.city = cityMatch[2].trim();
            listing.department = zipCode.substring(0, 2);
          }

          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async extractImages(page: Page): Promise<string[]> {
    const imageSelectors = [
      'img[src*="photo"], img[src*="image"]',
      '.gallery img',
      '.photos img',
      '.images img',
      '[data-testid="gallery"] img',
    ];

    for (const selector of imageSelectors) {
      try {
        const images = await page.$$eval(
          selector,
          (imgs) =>
            imgs
              .map((img: HTMLImageElement) => img.src)
              .filter(
                (src) =>
                  src &&
                  !src.includes('placeholder') &&
                  !src.includes('default')
              )
              .slice(0, 20) // Limit to 20 images
        );

        if (images.length > 0) {
          return images;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        continue;
      }
    }

    return [];
  }

  private async extractNotaryContact(
    page: Page
  ): Promise<RawListingOpportunity['notaryOffice']> {
    try {
      const contactSelectors = [
        '.notary-contact',
        '.contact-notaire',
        '.office-details',
        '.agence-details',
      ];

      for (const selector of contactSelectors) {
        try {
          const contactInfo = await page.$eval(selector, (el) => {
            const text = el.textContent || '';
            const links = Array.from(el.querySelectorAll('a'));

            return {
              text,
              phone: links
                .find((a) => a.href.startsWith('tel:'))
                ?.href.replace('tel:', ''),
              email: links
                .find((a) => a.href.startsWith('mailto:'))
                ?.href.replace('mailto:', ''),
              website: links.find((a) => a.href.startsWith('http'))?.href,
            };
          });

          if (contactInfo.text) {
            return {
              name: this.extractNotaryNameFromText(contactInfo.text),
              phone: contactInfo.phone,
              email: contactInfo.email,
              website: contactInfo.website,
              contact: contactInfo.text.trim(),
            };
          }
        } catch (e) {
          continue;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      // No contact info found
    }

    return undefined;
  }

  private extractExternalIdFromUrl(url: string): string {
    // Extract ID from URL patterns like /annonce/123456 or /bien/abc123
    const idMatch = url.match(
      /\/(?:annonce|bien|property|listing)\/([^\/\?]+)/
    );
    return idMatch ? `notary-${idMatch[1]}` : `notary-${Date.now()}`;
  }

  private extractPriceFromText(
    text: string
  ): { amount: number; type?: string } | null {
    const priceMatch = text.match(/([\d\s]+)\s*€/);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1].replace(/\s/g, ''), 10);
      const type = text.includes('FAI')
        ? 'FAI'
        : text.includes('CC')
          ? 'CC'
          : undefined;
      return { amount, type };
    }
    return null;
  }

  private extractNumberFromText(text: string): number | null {
    const match = text.match(/(\d+(?:[.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
  }

  private extractBooleanFromText(text: string): boolean {
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes('oui') ||
      lowerText.includes('yes') ||
      lowerText.includes('✓') ||
      lowerText.includes('disponible')
    );
  }

  private extractDepartmentFromAddress(address: string): string {
    const zipMatch = address.match(/(\d{5})/);
    return zipMatch ? zipMatch[1].substring(0, 2) : '75'; // Default to Paris
  }

  private extractCityFromAddress(address: string): string {
    const cityMatch = address.match(/\d{5}\s+([^,]+)/);
    return cityMatch ? cityMatch[1].trim() : 'Unknown';
  }

  private extractNotaryNameFromText(text: string): string {
    // Try to extract notary name from contact text
    const lines = text.split('\n');
    for (const line of lines) {
      if (
        line.includes('Notaire') ||
        line.includes('Maître') ||
        line.includes('SCP')
      ) {
        return line.trim();
      }
    }
    return 'Notaire'; // Default fallback
  }
}
