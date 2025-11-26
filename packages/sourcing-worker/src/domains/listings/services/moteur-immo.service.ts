import { Inject, Injectable, Logger } from '@nestjs/common';
import { EnergyClass, ListingInput, PropertyType, UNKNOWN_ENERGY_CLASS } from '@linkinvests/shared';
import type { ConfigType } from '~/config';
import { CONFIG_TOKEN } from '~/config';
import { ListingsJobFilters } from '../types';

export interface MoteurImmoListing {
  adId: string;
  reference: string;
  origin: string;
  creationDate: string;
  lastCheckDate: string;
  publicationDate?: string;
  lastModificationDate?: string;
  lastEventDate: string;
  title: string;
  type: string; // 'sale' | 'rental'
  category: string; // 'flat' | 'house' | 'premises' | 'land'
  publisher: {
    type: 'individual' | 'professional';
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    sirenNumber?: string;
  };
  description: string;
  url: string;
  pictureUrl?: string;
  pictureUrls: string[];
  location: {
    city: string;
    postalCode: string;
    inseeCode: string;
    departmentCode: number;
    regionCode: number;
    coordinates: [number, number]; // [longitude, latitude]
    population: number;
    propertyTaxRate?: number;
    district?: string;
    isRightLocation?: boolean;
  };
  position?: [number, number]; // [longitude, latitude]
  price?: number;
  priceDrop?: number;
  rent?: number;
  propertyCharges?: number;
  propertyTax?: number;
  rooms?: number;
  bedrooms?: number;
  pricePerSquareMeter?: number;
  surface?: number;
  landSurface?: number;
  constructionYear?: number;
  floor?: number;
  buildingFloors?: number;
  options: string[];
  energyValue?: number;
  energyGrade?: EnergyClass;
  gasValue?: number;
  gasGrade?: string;
  diagnosticDate?: string;
  priceStats?: {
    rent?: number;
    profitability?: number;
    priceGap?: number;
    lowPrice?: number;
    medianPrice?: number;
    highPrice?: number;
    versionId?: number;
  };
  duplicates: any[];
  uniqueId: string;
  originalPrice?: number;
}

interface MoteurImmoApiResponse {
  ads: MoteurImmoListing[];
  count?: number;
}

@Injectable()
export class MoteurImmoService {
  private readonly logger = new Logger(MoteurImmoService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  // Rate limiting configuration - 300 requests per minute = 5 requests per second
  // Using 4 requests per second (240/min) to stay under limit with safety margin
  private lastRequestTime = 0;
  private readonly minRequestInterval = 250; // 250ms between requests (4 requests/second)
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds base delay for exponential backoff

  // API discovered constraints
  private readonly apiPageSize = 1000; // Moteur Immo Max Page Size
  private readonly maxPages = 10; // (Moteur Immo API limit = 10000 listings)
  private hasTooManyListings = false;

  constructor(
    @Inject(CONFIG_TOKEN)
    private readonly config: ConfigType,
  ) {
    // Hard-coded base URL as discovered from API testing
    this.baseUrl = 'https://moteurimmo.fr/api';
    this.apiKey = this.config.MOTEUR_IMMO_API_KEY;
  }

  /**
   * Fetch all listings with the given filters
   * @param filters - Date and other filters for listings
   * @returns Array of all matching listings
   */
  async getListings(filters: ListingsJobFilters): Promise<ListingInput[]> {
    this.hasTooManyListings = false;
    const allListings: ListingInput[] = [];
    let page = 1;
    const pageSize = this.apiPageSize; // Fixed page size of 50 discovered from API testing
    let hasMorePages = true;

    while (hasMorePages && page <= this.maxPages && !this.hasTooManyListings) {
      try {
        const listings = await this.fetchListingsPage(filters, page);

        // Transform API response to ListingInput format
        const transformedListings = listings
          .map((listing) => this.transformListing(listing))
          .filter((listing): listing is ListingInput => listing !== null);

        allListings.push(...transformedListings);

        this.logger.log(
          `Fetched page ${page}: ${listings.length} raw records, ${transformedListings.length} valid listings (total: ${allListings.length})`,
        );

        // Check if we've reached the last page
        // TODO: Adjust pagination logic based on API documentation
        if (listings.length < pageSize) {
          hasMorePages = false;
        } else {
          page++;
        }
      } catch (error) {
        const err = error as Error;

        // If we get an error after fetching some records, it might be pagination limit
        if (allListings.length > 0 && err.message.includes('400')) {
          this.logger.warn(
            `Reached API pagination limit at page ${page}. Continuing with ${allListings.length} listings already fetched.`,
          );
          hasMorePages = false;
        } else {
          this.logger.error(`Failed to fetch page ${page}: ${err.message}`);
          throw error;
        }
      }
    }

    this.logger.log(
      `Completed fetching ${allListings.length} listings from Moteur Immo`,
    );

    if (this.hasTooManyListings) {
      throw new Error('Moteur Immo API returned too many listings');
    }

    return allListings;
  }

  /**
   * Fetch a single page of listings with rate limiting and retry logic
   */
  private async fetchListingsPage(
    filters: ListingsJobFilters,
    page: number,
  ): Promise<MoteurImmoListing[]> {
    const requestBody = this.buildApiRequestBody(filters, page);

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        const response = await fetch(`${this.baseUrl}/ads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...requestBody,
            withCount: page === 1,
          }),
          signal: AbortSignal.timeout(30000), // 30 seconds timeout
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            `Rate limited on page ${page}. Waiting ${waitTime}ms before retry ${attempt}/${this.maxRetries}`,
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(
            `Moteur Immo API returned status ${response.status}: ${errorText}`,
          );
        }

        const data = (await response.json()) as MoteurImmoApiResponse;
        if (data.count) {
          this.logger.log(`Found ${data.count} listings`);
          if (data.count > 10000) {
            this.hasTooManyListings = true;
          }
        }

        return data.ads || [];
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Attempt ${attempt}/${this.maxRetries} failed for page ${page}: ${lastError.message}. Retrying...`,
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    this.logger.error(
      `Failed to fetch listings from Moteur Immo API after ${this.maxRetries} attempts: ${lastError?.message}`,
      lastError?.stack,
    );
    throw (
      lastError || new Error('Failed to fetch listings from Moteur Immo API')
    );
  }

  /**
   * Transform Moteur Immo API response to ListingInput format
   */
  private transformListing(apiListing: MoteurImmoListing): ListingInput | null {
    try {
      return {
        label: apiListing.title || 'Unknown Property',
        address: `${apiListing.location.city}, ${apiListing.location.postalCode}`,
        zipCode: apiListing.location.postalCode,
        department: apiListing.location.departmentCode
          .toString()
          .padStart(2, '0'),
        latitude: apiListing.location.coordinates[1], // coordinates are [longitude, latitude]
        longitude: apiListing.location.coordinates[0],
        opportunityDate: (
          apiListing.publicationDate ?? apiListing.creationDate
        ).split('T')[0],
        lastChangeDate: (
          apiListing.lastEventDate ?? apiListing.creationDate
        ).split('T')[0],
        url: apiListing.url,
        source: apiListing.origin,
        propertyType: this.mapPropertyType(apiListing.category),
        description: apiListing.description,
        squareFootage: apiListing.surface ?? undefined,
        rooms: apiListing.rooms ?? undefined,
        bedrooms: apiListing.bedrooms ?? undefined,
        energyClass: apiListing.energyGrade ?? UNKNOWN_ENERGY_CLASS,
        price: apiListing.price,
        pictures: apiListing.pictureUrls || [],
        sellerType: apiListing.publisher.type,
        sellerContact: {
          name: this.checkContactInfo(apiListing.publisher.name),
          address: this.checkContactInfo(apiListing.publisher.address),
          phone: this.checkContactInfo(apiListing.publisher.phone),
          email: this.checkContactInfo(apiListing.publisher.email),
          siret: this.checkContactInfo(apiListing.publisher.sirenNumber),
        },
        mainPicture: apiListing.pictureUrl || apiListing.pictureUrls?.[0],
        externalId: `${apiListing.origin}-${apiListing.adId}`,
        isSoldRented: apiListing.options.includes('isSoldRented'),
      };
    } catch (error) {
      this.logger.warn(
        `Failed to transform listing ${apiListing.adId}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Map Moteur Immo property type to our PropertyType enum
   */
  private mapPropertyType(apiCategory?: string): PropertyType {
    if (!apiCategory) return PropertyType.OTHER;

    const category = apiCategory.toLowerCase();

    switch (category) {
      case 'flat':
        return PropertyType.FLAT;
      case 'house':
        return PropertyType.HOUSE;
      case 'shop':
      case 'office':
      case 'premises':
        return PropertyType.COMMERCIAL;
      case 'land':
        return PropertyType.LAND; // Commercial/office premises
      default:
        return PropertyType.OTHER;
    }
  }

  /**
   * Build the Moteur Immo API request body for POST /ads endpoint
   */
  private buildApiRequestBody(
    filters: ListingsJobFilters,
    page: number,
  ): Record<string, unknown> {
    const requestBody: Record<string, unknown> = {
      apiKey: this.apiKey,
      page,
      maxLength: this.apiPageSize,
      types: ['sale'],
      categories: ['house', 'flat', 'office', 'premises', 'shop', 'block'],
      options: ['isOld', 'isNotUnderCompromise'],
    };

    if (filters.afterDate) {
      if (filters.usePublicationDate) {
        requestBody.creationDateAfter = new Date(
          filters.afterDate,
        ).toISOString();
      } else {
        requestBody.lastEventDateAfter = new Date(
          filters.afterDate,
        ).toISOString();
      }
    }
    if (filters.beforeDate) {
      if (filters.usePublicationDate) {
        requestBody.creationDateBefore = new Date(
          filters.beforeDate,
        ).toISOString();
      } else {
        requestBody.lastEventDateBefore = new Date(
          filters.beforeDate,
        ).toISOString();
      }
    }

    if (filters.energyGradeMax) {
      requestBody.energyGradeMax = filters.energyGradeMax;
    }

    if (filters.energyGradeMin) {
      requestBody.energyGradeMin = filters.energyGradeMin;
    }

    // Property type filtering - CONFIRMED: works with 'categories' parameter
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      requestBody.categories = filters.propertyTypes.map((type) => {
        // Map our PropertyType to API categories
        switch (type.toLowerCase()) {
          case 'apartment':
            return 'flat';
          case 'house':
            return 'house';
          case 'terrain':
            return 'land';
          default:
            return type;
        }
      });
    }

    // Department filtering: parameter name needs to be discovered
    if (filters.departmentCode) {
      requestBody.locations = [
        {
          departmentCode: filters.departmentCode,
        },
      ];
    }

    return requestBody;
  }

  private checkContactInfo(info?: string): string | undefined {
    if (!info) return undefined;
    if (info === 'hidden') return undefined;
    return info;
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
