import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'playwright';

import {
  type NextDataJson,
  type LotData,
  type AdressData,
  type RawAuctionInput,
  LotOccupationStatus,
} from '../types';
import { BrowserService } from './browser.service';
import { DEPARTMENT_IDS_MAP } from '../constants/departments';
import {
  AuctionOccupationStatus,
  AuctionSource,
  PropertyType,
  UNKNOWN_ENERGY_CLASS,
} from '@linkinvests/shared';

interface DetailScraperResult {
  success: boolean;
  scrapedAuction?: RawAuctionInput;
  error?: string;
}

@Injectable()
export class DetailScraperService {
  private readonly logger = new Logger(DetailScraperService.name);
  private readonly baseUrl = 'https://www.encheres-publiques.com';

  constructor(private readonly browserService: BrowserService) {}

  async scrapeDetails(url: string): Promise<DetailScraperResult> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    try {
      // Navigate to detail page
      await this.browserService.navigateToUrl(fullUrl);
      await this.browserService.waitForContent();
      const page = this.browserService.getPage();

      // Extract JSON data from __NEXT_DATA__ script tag
      const jsonData = await this.extractJsonData(page);
      if (!jsonData) {
        throw new Error('No __NEXT_DATA__ found on page');
      }

      // Parse auction data from JSON
      const scrapedAuction = this.parseAuctionDataFromJson(jsonData, fullUrl);

      this.logger.debug(
        { url: fullUrl, lotId: scrapedAuction.externalId },
        'Successfully extracted auction data from JSON'
      );

      return { success: true, scrapedAuction };
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

  async scrapeDetailsBatch(
    urls: string[],
    batchSize: number = 10
  ): Promise<RawAuctionInput[]> {
    const scrapedAuctions: RawAuctionInput[] = [];
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

        const result = await this.scrapeDetails(url);

        if (result.success && result.scrapedAuction) {
          scrapedAuctions.push(result.scrapedAuction);
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
      { total: scrapedAuctions.length, processed, failed },
      `Detail scraping complete: ${scrapedAuctions.length} scrapedAuctions extracted`
    );

    return scrapedAuctions;
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
  ): RawAuctionInput {
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
    if (!lotData || lotData.__typename !== 'Lot') {
      throw new Error(`No lot data found for ID: ${lotId}`);
    }

    // Extract basic query data
    const propertyType = query.sous_categorie || '';

    // Extract address - prefer adresse object, fallback to parsing nom
    const { text, latitude, longitude, city, departmentId } =
      this.extractAdress(lotData, apolloState, url);

    const { mainPicture, pictures } = this.getPictures(lotData);

    // Build the opportunity object
    const opportunity: RawAuctionInput = {
      url,
      label: this.extractTitleFromNom(lotData.nom),
      address: text,
      city,
      department: departmentId.toString().padStart(2, '0'),
      latitude: latitude || 0,
      longitude: longitude || 0,
      opportunityDate: this.extractAuctionDate(lotData),
      mainPicture,
      source: AuctionSource.ENCHERES_PUBLIQUES,
      pictures,
      externalId: `${AuctionSource.ENCHERES_PUBLIQUES}-${lotId}`,
      propertyType: this.getPropertyType(propertyType),
      currentPrice: Number(lotData.offre_actuelle) || undefined,
      lowerEstimate: Number(lotData.estimation_basse) || undefined,
      upperEstimate: Number(lotData.estimation_haute) || undefined,
      reservePrice: Number(lotData.prix_plancher) || undefined,
      description: lotData.description || undefined,
      energyClass: lotData.critere_consommation_energetique ?? UNKNOWN_ENERGY_CLASS,
      squareFootage: Number(lotData.critere_surface_habitable) || undefined,
      rooms: Number(lotData.critere_nombre_de_pieces) || undefined,
      auctionVenue: lotData.organisateur?.nom || undefined,
      occupationStatus: this.extractOccupationStatus(lotData),
    };

    return opportunity;
  }

  private getPropertyType(propertyType: string): PropertyType {
    if (propertyType.toLowerCase().includes('maison'))
      return PropertyType.HOUSE;
    if (propertyType.toLowerCase().includes('appartement'))
      return PropertyType.FLAT;
    if (propertyType.toLowerCase().includes('terrain'))
      return PropertyType.LAND;
    return PropertyType.OTHER;
  }

  private getPictures(lotData: LotData): {
    mainPicture?: string;
    pictures?: string[];
  } {
    const mainPicture = lotData.photo;
    const pictures = lotData.photos
      ?.map((photo: { src: string }) => photo.src)
      .filter((src: string) => src !== mainPicture);
    return {
      mainPicture: mainPicture
        ? `https://www.encheres-publiques.com${mainPicture}`
        : undefined,
      pictures: pictures
        ? pictures.map(
            (src: string) => `https://www.encheres-publiques.com${src}`
          )
        : undefined,
    };
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

  private extractAdress(
    lotData: LotData,
    allData: { [key: string]: LotData | AdressData },
    url: string
  ): {
    text: string;
    latitude?: number;
    longitude?: number;
    city: string;
    departmentId: number;
  } {
    const ref = lotData.adresse_physique?._ref || lotData.adresse?._ref;
    const adressData = ref ? allData[ref] : null;
    if (adressData && adressData.__typename === 'Adresse') {
      return {
        text: adressData.text,
        latitude: adressData.coords[0],
        longitude: adressData.coords[1],
        city: adressData.ville,
        departmentId: DEPARTMENT_IDS_MAP[adressData.department_slug],
      };
    }

    const nom = lotData.nom.toLowerCase();
    let text = nom;
    for (const separator of [
      'située à',
      'situé à',
      'située au',
      'situé au',
      'situées',
      'située',
      'situés',
      'situé',
    ]) {
      const index = nom.toLowerCase().indexOf(separator.toLowerCase());
      if (index > 0) {
        text = nom
          .split(separator)[1]
          .split('-')
          .join(' ')
          .trim()
          .replaceAll('.', '');
        if (text.includes(' à ')) {
          text = text.replace(' à ', ' ');
        }
        break;
      }
    }

    let city = '';
    let departmentId = 0;
    const urlMatch = url.match(/\/([a-z-]+)-(\d{2})\//);
    if (urlMatch) {
      city = urlMatch[1].split('-').join(' ');
      departmentId = Number(urlMatch[2]);
    }

    return { text, city, departmentId };
  }

  private extractOccupationStatus(lotData: LotData): AuctionOccupationStatus {
    const rawStatus = lotData.critere_occupation_du_bien;
    if (!rawStatus) {
      return AuctionOccupationStatus.UNKNOWN;
    }

    switch (rawStatus) {
      case LotOccupationStatus.OCCUPIED_BY_OWNER:
        return AuctionOccupationStatus.OCCUPIED_BY_OWNER;
      case LotOccupationStatus.RENTED:
        return AuctionOccupationStatus.RENTED;
      case LotOccupationStatus.FREE:
        return AuctionOccupationStatus.FREE;
      default:
        return AuctionOccupationStatus.UNKNOWN;
    }
  }
}
