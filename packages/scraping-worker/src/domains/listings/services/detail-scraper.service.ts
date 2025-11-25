import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service.js';
import type { RawListingOpportunity } from '~/domains/listings/types/listings.types.js';
import { Page } from 'playwright';
import { EnergyClass, PropertyType } from '@linkinvests/shared';

// Intermediate data structures for extraction
interface TitleInfo {
  label: string;
  propertyType: PropertyType;
  city: string;
  department: string;
  zipCode: string;
  price: number;
  squareFootage?: number;
}

interface PropertyDetails {
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  floor?: number;
  totalFloors?: number;
  constructionYear?: number;
}

interface PropertyFeatures {
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;
}

interface NotaryOfficeInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contact?: string;
}

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
      try {
        await page.waitForLoadState('networkidle', {
          timeout: 10000,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        await this.discardCookies(this.browserService);
      }

      await page.waitForLoadState('networkidle', {
        timeout: 10000,
      });

      this.logger.debug({ url }, 'Starting extraction for listing');

      // Phase 1: Extract basic required information
      const titleInfo = await this.extractTitleInfo(page);
      const externalId = this.extractExternalIdFromUrl(url);
      const opportunityDate = await this.extractOpportunityDate(page);
      const description = await this.extractDescription(page);

      // Phase 2: Extract property details
      const propertyDetails = await this.extractPropertyDetails(page);
      const features = await this.extractFeatures(page);

      // Phase 4: Extract complex data
      const images = await this.extractImages(page);
      const notaryOffice = await this.extractNotaryOffice(page);
      const energyClass = await this.extractDPE(page);
      if (!energyClass) {
        return null;
      }

      // Phase 5: Combine all extracted data
      const listing: RawListingOpportunity = {
        // Basic info
        url,
        source: 'notaires',
        label: titleInfo.label,
        externalId,
        opportunityDate,
        description,

        // Location info from title parsing
        city: titleInfo.city,
        zipCode: titleInfo.zipCode,
        department: titleInfo.department,

        // Transaction info
        propertyType: titleInfo.propertyType,

        // Pricing
        price: titleInfo.price,

        // Property details
        squareFootage: titleInfo.squareFootage ?? propertyDetails.squareFootage,
        landArea: propertyDetails.landArea,
        rooms: propertyDetails.rooms,
        bedrooms: propertyDetails.bedrooms,
        floor: propertyDetails.floor,
        totalFloors: propertyDetails.totalFloors,
        constructionYear: propertyDetails.constructionYear,

        // Features
        balcony: features.balcony,
        terrace: features.terrace,
        garden: features.garden,
        garage: features.garage,
        parking: features.parking,
        elevator: features.elevator,

        // Complex data
        images,
        notaryOffice,
        energyClass,
      };

      // Validate required fields
      if (!listing.label || !listing.city || !listing.department) {
        this.logger.warn(
          {
            url,
            label: listing.label,
            city: listing.city,
            department: listing.department,
          },
          'Missing required fields'
        );
        return null;
      }

      this.logger.debug(
        {
          url,
          label: listing.label,
          city: listing.city,
          price: listing.price,
          rooms: listing.rooms,
          imagesCount: listing.images?.length || 0,
          hasNotaryInfo: !!listing.notaryOffice,
        },
        'Successfully extracted listing data'
      );

      return listing;
    } catch (error: unknown) {
      this.logger.error(
        {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        'Error scraping individual listing'
      );

      return null;
    }
  }

  private async discardCookies(browserService: BrowserService): Promise<void> {
    try {
      await browserService.handleTarteaucitronCookieConsent();
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to discard cookies'
      );
    }
  }

  // Text processing utility methods
  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseSurface(surfaceText: string): number | undefined {
    if (!surfaceText) return undefined;

    // Extract number from text like "243 m²" or "833 m<sup>2</sup>"
    const match = surfaceText.match(/(\d+(?:[.,]\d+)?)/);
    if (!match) return undefined;

    const number = parseFloat(match[1].replace(',', '.'));
    return isNaN(number) ? undefined : number;
  }

  private parseDate(dateText: string): Date | undefined {
    if (!dateText) return undefined;

    try {
      const date = new Date(dateText);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }

  private parseBoolean(text: string): boolean | undefined {
    if (!text) return undefined;

    const cleaned = text.toLowerCase().trim();
    if (
      cleaned === 'oui' ||
      cleaned === 'yes' ||
      cleaned === 'true' ||
      cleaned === '1'
    ) {
      return true;
    }
    if (
      cleaned === 'non' ||
      cleaned === 'no' ||
      cleaned === 'false' ||
      cleaned === '0'
    ) {
      return false;
    }
    return undefined;
  }

  private extractNumberFromText(text: string): number | undefined {
    if (!text) return undefined;

    const match = text.match(/(\d+)/);
    if (!match) return undefined;

    const number = parseInt(match[1], 10);
    return isNaN(number) ? undefined : number;
  }

  private extractExternalIdFromUrl(url: string): string {
    // Extract ID from URL patterns like /fr/annonce-immo/vente/maison/guingamp-22/1821467
    const idMatch = url.match(/\/(\d+)$/);
    return idMatch ? `notary-${idMatch[1]}` : `notary-${Date.now()}`;
  }

  // Basic Information extraction methods
  private async extractTitleInfo(page: Page): Promise<TitleInfo> {
    const labelElement = page.locator('title');
    const titleText = await labelElement.textContent();
    // Maison / villa à A vendre 5 pièces (135 m²) - CHATEAU RENARD 45220 - 168 000 €
    const [info, location, rawPrice] = titleText?.split(' - ') || [];
    const price = rawPrice?.replace(/€/g, '').replace(/\s+/g, '').trim();

    const locationRegex = /(\w+) (\d{5})/;
    const locationMatch = location.match(locationRegex);
    const city = locationMatch ? locationMatch[1] : undefined;
    const zipCode = locationMatch ? locationMatch[2] : undefined;
    const department = zipCode ? zipCode.substring(0, 2) : undefined;
    if (!department || !city || !zipCode || !price || !info) {
      throw new Error('Invalid title');
    }

    const squareFooterRegex = /(\d+(?:[.,]\d+)?) m²/;
    const squareFooterMatch = info.match(squareFooterRegex);
    const squareFootage = squareFooterMatch
      ? Number(squareFooterMatch[1])
      : undefined;

    return {
      label: info,
      price: Number(price),
      city,
      zipCode,
      department,
      squareFootage,
      ...this.parseTitleComponents(info),
    };
  }

  private parseTitleComponents(titleText: string): {
    propertyType: PropertyType;
  } {
    // Example title: "Vente Maison 10 pièces - Guingamp - Côtes-d'Armor (22)"
    const result: {
      propertyType: PropertyType;
    } = {
      propertyType: PropertyType.OTHER,
    };
    const formattedText = titleText.toLowerCase();
    if (formattedText.includes('maison'))
      result.propertyType = PropertyType.HOUSE;
    else if (formattedText.includes('appartement'))
      result.propertyType = PropertyType.FLAT;
    else if (formattedText.includes('terrain'))
      result.propertyType = PropertyType.LAND;

    return result;
  }

  private async extractDescription(page: Page): Promise<string | undefined> {
    try {
      const descElement = await page.$('[data-description-contenu] p');
      if (descElement) {
        const descText = await descElement.textContent();
        return this.cleanText(descText || '');
      }
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract description'
      );
    }
    return undefined;
  }

  private async extractOpportunityDate(page: Page): Promise<Date> {
    try {
      const dateElement = await page.$('[data-description-maj]');
      if (dateElement) {
        const dateText = await dateElement.textContent();
        const parsed = this.parseDate(this.cleanText(dateText || ''));
        if (parsed) return parsed;
      }
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract opportunity date'
      );
    }
    return new Date(); // Fallback to current date
  }

  // Property details extraction
  private async extractPropertyDetails(page: Page): Promise<PropertyDetails> {
    const result: PropertyDetails = {};

    try {
      // Extract rooms
      const roomsElement = await page.$('#data-description-nbPieces\\.texte');
      if (roomsElement) {
        const roomsText = await roomsElement.textContent();
        result.rooms = this.extractNumberFromText(
          this.cleanText(roomsText || '')
        );
      }

      // Extract bedrooms
      const bedroomsElement = await page.$('#data-description-nbChambres');
      if (bedroomsElement) {
        const bedroomsText = await bedroomsElement.textContent();
        result.bedrooms = this.extractNumberFromText(
          this.cleanText(bedroomsText || '')
        );
      }

      // Extract surface area
      const surfaceElement = await page.$('#data-description-surfaceHabitable');
      if (surfaceElement) {
        const surfaceText = await surfaceElement.textContent();
        result.squareFootage = this.parseSurface(
          this.cleanText(surfaceText || '')
        );
      }

      // Extract land area
      const landElement = await page.$('[data-description-surfaceterrain]');
      if (landElement) {
        const landText = await landElement.textContent();
        result.landArea = this.parseSurface(this.cleanText(landText || ''));
      }

      // Extract construction period and try to get year
      const constructionElement = await page.$(
        '[data-description-epoqueconstruction]'
      );
      if (constructionElement) {
        const constructionText = await constructionElement.textContent();
        const yearMatch = this.cleanText(constructionText || '').match(
          /(\d{4})/
        );
        if (yearMatch) {
          result.constructionYear = parseInt(yearMatch[1], 10);
        }
      }
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract property details'
      );
    }

    return result;
  }

  // Property features extraction
  private async extractFeatures(page: Page): Promise<PropertyFeatures> {
    const result: PropertyFeatures = {};

    try {
      // Extract parking info
      const parkingElement = await page.$('[data-description-stationnement]');
      if (parkingElement) {
        const parkingText = await parkingElement.textContent();
        result.parking = this.parseBoolean(this.cleanText(parkingText || ''));
      }

      // Extract pool info (available but not in current interface)
      const poolElement = await page.$('[data-description-piscine]');
      if (poolElement) {
        // const poolText = await poolElement.textContent();
        // Note: Pool info is available but not in our interface - could be added to extraData later
      }

      // Note: Other features like balcony, terrace, garden, garage, elevator
      // are not available in the current HTML structure but could be added
      // when the HTML structure is updated
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract features'
      );
    }

    return result;
  }

  // Notary office extraction
  private async extractNotaryOffice(
    page: Page
  ): Promise<NotaryOfficeInfo | undefined> {
    try {
      const result: NotaryOfficeInfo = {};

      // Extract office name
      const nameElement = await page.$('[data-nom-office] a');
      if (nameElement) {
        const nameText = await nameElement.textContent();
        result.name = this.cleanText(nameText || '');
      }

      // Extract office address
      const addressElement = await page.$('[data-adresse-office]');
      if (addressElement) {
        const addressText = await addressElement.textContent();
        result.address = this.cleanText(addressText || '');
      }

      // Extract contact name
      const contactElement = await page.$('[data-contact-nom]');
      if (contactElement) {
        const contactText = await contactElement.textContent();
        result.contact = this.cleanText(contactText || '');
      }

      // Extract phone (though it might be behind a click)
      const phoneElement = await page.$('[data-contact-tel]');
      if (phoneElement) {
        const phoneText =
          (await phoneElement.getAttribute('data-phone')) ||
          (await phoneElement.textContent());
        if (phoneText) {
          result.phone = this.cleanText(phoneText);
        }
      }

      return Object.keys(result).length > 0 ? result : undefined;
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract notary office'
      );
      return undefined;
    }
  }

  // Images extraction
  private async extractImages(page: Page): Promise<string[]> {
    try {
      const images: string[] = [];

      // Look for images in the gallery/slider component
      const imageElements = await page.$$(
        'ng-image-slider .custom-image-main img'
      );

      for (const img of imageElements) {
        const src = await img.getAttribute('src');
        if (src && !src.includes('data:image')) {
          // Exclude placeholder images
          images.push(src);
        }
      }

      return images;
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract images'
      );
      return [];
    }
  }

  // DPE extraction
  private async extractDPE(page: Page): Promise<EnergyClass | undefined> {
    try {
      // Fallback: look for letter in .lettres element
      const letterElement = await page.$('.lettres');
      if (letterElement) {
        const letter = await letterElement.getAttribute('letter');
        if (letter) {
          return letter.toUpperCase() as EnergyClass;
        }
      }
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to extract DPE'
      );
    }
    return undefined;
  }
}
