import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'playwright';

import type { AuctionOpportunity, NextDataJson, LotData } from '../types';
import { BrowserService } from './browser.service';

interface DetailScraperResult {
  success: boolean;
  opportunity?: AuctionOpportunity;
  error?: string;
}

@Injectable()
export class DetailScraperService {
  private readonly logger = new Logger(DetailScraperService.name);
  private readonly baseUrl = 'https://www.encheres-publiques.com';

  constructor() {}

  async scrapeDetails(
    browserService: BrowserService,
    url: string
  ): Promise<DetailScraperResult> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    try {
      // Navigate to detail page
      await browserService.navigateToUrl(fullUrl);
      await browserService.waitForContent();
      const page = browserService.getPage();

      // Extract JSON data from __NEXT_DATA__ script tag
      const jsonData = await this.extractJsonData(page);
      if (!jsonData) {
        throw new Error('No __NEXT_DATA__ found on page');
      }

      // Parse auction data from JSON
      const opportunity = this.parseAuctionDataFromJson(jsonData, fullUrl);

      this.logger.debug(
        { url: fullUrl, lotId: opportunity.extraData?.id },
        'Successfully extracted auction data from JSON'
      );

      return { success: true, opportunity };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        { url: fullUrl, error: errorMessage },
        'Failed to scrape detail page'
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Extract JSON data from __NEXT_DATA__ script tag
   */
  private async extractJsonData(page: Page): Promise<NextDataJson | null> {
    return await page.evaluate(() => {
      const dataElement = document.querySelector('#__NEXT_DATA__');
      if (!dataElement?.textContent) {
        return null;
      }

      try {
        return JSON.parse(dataElement.textContent) as NextDataJson;
      } catch {
        return null;
      }
    });
  }

  /**
   * Parse auction data from JSON according to YAML specification
   */
  private parseAuctionDataFromJson(
    jsonData: NextDataJson,
    url: string
  ): AuctionOpportunity {
    const props = jsonData.props;
    const query = jsonData.query;
    const apolloState = props?.pageProps?.apolloState?.data || {};

    // Extract lot ID from query
    const lotId = query?.lot_id;
    if (!lotId) {
      throw new Error('No lot_id found in query parameters');
    }

    // Find lot data in Apollo state
    const lotKey = `Lot:${lotId}`;
    const lotData = apolloState[lotKey];
    if (!lotData) {
      throw new Error(`No lot data found for ID: ${lotId}`);
    }

    // Extract basic query data
    const auctionType = query.categorie || 'immobilier';
    const propertyType = query.sous_categorie || '';

    // Extract title - split on 'situé' and take first part
    const rawTitle = lotData.nom || '';
    const title = this.extractTitleFromNom(rawTitle);

    // Extract address - prefer adresse object, fallback to parsing nom
    let address = '';
    const latitude = 0;
    const longitude = 0;
    let zipCode = 0;
    let department = 0;

    if (lotData.adresse) {
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS')
      console.log('GOT ADRESS', lotData.adresse)
      address = lotData.adresse;
      // Extract postal code and department from address
      const postalCodeMatch = address.match(/(\d{5})/);
      if (postalCodeMatch) {
        zipCode = parseInt(postalCodeMatch[1], 10);
        department = parseInt(postalCodeMatch[1].substring(0, 2), 10);
      }
    } else {
      // Fallback: extract address from nom field
      address = this.extractAddressFromNom(rawTitle);
      // Try to extract department from URL as fallback
      const urlMatch = url.match(/\/([a-z-]+)-(\d{2,3})\//);
      if (urlMatch) {
        department = parseInt(urlMatch[2], 10);
        zipCode = department * 1000;
      }
    }

    // Extract auction date - priority order per YAML
    const auctionDate = this.extractAuctionDate(lotData);

    // Build the opportunity object
    const opportunity: AuctionOpportunity = {
      url,
      label: title,
      address: address || 'Adresse non disponible',
      zipCode: zipCode || 75000,
      department: department || 75,
      latitude,
      longitude,
      auctionDate,
      extraData: {
        id: lotId,
        auctionType,
        propertyType,
        currentPrice: Number(lotData.offre_actuelle) || undefined,
        lowerEstimate: Number(lotData.estimation_basse) || undefined,
        upperEstimate: Number(lotData.estimation_haute) || undefined,
        reservePrice: Number(lotData.prix_plancher) || undefined,
        description: lotData.description || undefined,
        dpe: lotData.critere_consommation_energetique || undefined,
        area: Number(lotData.critere_surface_habitable) || undefined,
        rooms: Number(lotData.critere_nombre_de_pieces) || undefined,
        auctionVenue: lotData.organisateur?.nom || undefined,
      },
    };

    return opportunity;
  }

  /**
   * Extract title from nom field - split on 'situé' and take first part
   */
  private extractTitleFromNom(nom: string): string {
    if (!nom) return 'Bien immobilier';

    const index = nom.toLowerCase().indexOf('situé');
    if (index > 0) {
      return nom.substring(0, index).trim();
    }

    return nom;
  }

  /**
   * Extract address from nom field - split on 'situé' and take last part
   */
  private extractAddressFromNom(nom: string): string {
    if (!nom) return '';

    // Split on various forms of 'situé' and take the last part
    const splitPatterns = ['située à', 'situé à', 'situé'];

    for (const pattern of splitPatterns) {
      const index = nom.toLowerCase().indexOf(pattern.toLowerCase());
      if (index >= 0) {
        return nom.substring(index + pattern.length).trim();
      }
    }

    return '';
  }

  /**
   * Extract auction date with priority order: fermeture_reelle_date || encheres_fermeture_date || fermeture_date
   */
  private extractAuctionDate(lotData: LotData): string {
    const timestamps = [
      lotData.fermeture_reelle_date,
      lotData.encheres_fermeture_date,
      lotData.fermeture_date,
    ];

    for (const timestamp of timestamps) {
      if (timestamp) {
        try {
          // Convert Unix timestamp to ISO date string
          const date = new Date(Number(timestamp) * 1000);
          return date.toISOString().split('T')[0];
        } catch {
          // Continue to next timestamp if conversion fails
        }
      }
    }

    // Fallback to current date
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract image URLs from photos array
   */
  private extractImages(photos: unknown[]): string[] {
    if (!Array.isArray(photos)) return [];

    return photos
      .map((photo: unknown) => {
        if (typeof photo === 'string') return photo;
        if (typeof photo === 'object' && photo !== null && 'src' in photo) {
          return (photo as { src: string }).src;
        }
        return null;
      })
      .filter((url: string | null): url is string => url !== null)
      .map((url: string) => {
        // Convert relative URLs to absolute URLs
        if (url.startsWith('/')) {
          return `${this.baseUrl}${url}`;
        }
        return url;
      });
  }

  async scrapeDetailsBatch(
    browserService: BrowserService,
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

        const result = await this.scrapeDetails(browserService, url);

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
}
