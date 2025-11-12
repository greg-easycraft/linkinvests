import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from './browser.service.js';
import { ListingExtractorService } from './listing-extractor.service.js';
import { DetailScraperService } from './detail-scraper.service.js';
import { ListingsGeocodingService } from './geocoding.service.js';
import type {
  ListingOpportunity,
  ListingScrapingConfig,
  ListingScrapingStats,
} from '~/domains/listings/types/listings.types.js';

@Injectable()
export class NotaryScraperService {
  private readonly logger = new Logger(NotaryScraperService.name);

  constructor(
    private readonly browserService: BrowserService,
    private readonly listingExtractorService: ListingExtractorService,
    private readonly detailScraperService: DetailScraperService,
    private readonly geocodingService: ListingsGeocodingService
  ) {}

  async scrapeNotaryListings(): Promise<ListingOpportunity[]> {
    const config: ListingScrapingConfig = {
      baseUrl:
        'https://www.immobilier.notaires.fr/fr/annonces-immobilieres-liste?typeBien=APP,MAI&typeTransaction=VENTE,VNI,VAE',
      maxPages: 50, // Limit to reasonable number for initial implementation
      delayBetweenPages: 2000, // 2 seconds between pages
      delayBetweenListings: 2000, // 2 seconds between listing details
      maxRetries: 3,
      screenshots: false, // Disable for production
    };

    const stats: ListingScrapingStats = {
      totalListingsFound: 0,
      totalListingsProcessed: 0,
      successfulListings: 0,
      failedListings: 0,
      geocodedListings: 0,
      listingsWithImages: 0,
      startTime: new Date(),
      pagesProcessed: 0,
      errors: [],
    };

    this.logger.log('Starting notary listings scraping process');

    try {
      // Initialize browser
      await this.browserService.initialize();
      this.logger.log('Browser initialized for notary scraping');

      // Step 1: Extract all listing URLs from paginated pages
      this.logger.log('Step 1: Extracting listing URLs from pages');
      const listingUrls =
        await this.listingExtractorService.extractAllListingUrls(config);

      stats.totalListingsFound = listingUrls.length;
      this.logger.log(
        { totalUrls: listingUrls.length },
        'Listing URLs extraction completed'
      );

      if (listingUrls.length === 0) {
        this.logger.warn('No listing URLs found, stopping scraping');
        return [];
      }

      // Step 2: Scrape details from individual listing pages
      this.logger.log('Step 2: Scraping details from individual listings');
      const rawListings =
        await this.detailScraperService.scrapeListingDetails(listingUrls);

      stats.totalListingsProcessed = rawListings.length;
      stats.successfulListings = rawListings.length;
      stats.failedListings = listingUrls.length - rawListings.length;

      this.logger.log(
        {
          total: listingUrls.length,
          successful: rawListings.length,
          failed: stats.failedListings,
        },
        'Detail scraping completed'
      );

      if (rawListings.length === 0) {
        this.logger.warn('No listing details could be scraped');
        return [];
      }

      // Count listings with images
      stats.listingsWithImages = rawListings.filter(
        (listing) => listing.images && listing.images.length > 0
      ).length;

      // Step 3: Geocode addresses to get precise coordinates
      this.logger.log('Step 3: Geocoding listing addresses');
      const geocodedListings =
        await this.geocodingService.geocodeBatch(rawListings);

      stats.geocodedListings = geocodedListings.length;

      this.logger.log(
        {
          totalToGeocode: rawListings.length,
          successful: geocodedListings.length,
          failed: rawListings.length - geocodedListings.length,
        },
        'Geocoding completed'
      );

      // Step 4: Final validation and cleanup
      const validListings = this.validateAndCleanListings(geocodedListings);

      stats.endTime = new Date();
      stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

      this.logFinalStatistics(stats, validListings);

      return validListings;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      stats.errors.push(errorMessage);

      this.logger.error(
        {
          error: errorMessage,
          stats: {
            totalFound: stats.totalListingsFound,
            processed: stats.totalListingsProcessed,
            geocoded: stats.geocodedListings,
          },
        },
        'Error during notary scraping process'
      );

      throw error;
    } finally {
      // Always close browser
      try {
        await this.browserService.close();
        this.logger.log('Browser closed successfully');
      } catch (closeError) {
        this.logger.error(
          {
            error:
              closeError instanceof Error
                ? closeError.message
                : 'Unknown error',
          },
          'Error closing browser'
        );
      }
    }
  }

  private validateAndCleanListings(
    listings: ListingOpportunity[]
  ): ListingOpportunity[] {
    const validListings: ListingOpportunity[] = [];

    for (const listing of listings) {
      // Validate required fields
      if (
        !listing.label ||
        !listing.address ||
        !listing.latitude ||
        !listing.longitude
      ) {
        this.logger.debug(
          {
            externalId: listing.externalId,
            hasLabel: !!listing.label,
            hasAddress: !!listing.address,
            hasCoordinates: !!(listing.latitude && listing.longitude),
          },
          'Skipping listing with missing required fields'
        );
        continue;
      }

      // Clean and normalize data
      const cleanListing: ListingOpportunity = {
        ...listing,
        label: listing.label.trim(),
        address: listing.address.trim(),
        description: listing.description?.trim(),
        // Ensure department is 2 digits
        department: listing.department.padStart(2, '0'),
        // Set property and transaction types from URL params if missing
        propertyType:
          listing.propertyType || this.extractPropertyTypeFromUrl(listing.url),
        transactionType:
          listing.transactionType ||
          this.extractTransactionTypeFromUrl(listing.url),
        // Ensure images array exists
        images: listing.images || [],
        // Set default opportunity date to today if missing
        opportunityDate:
          listing.opportunityDate || new Date().toISOString().split('T')[0],
      };

      validListings.push(cleanListing);
    }

    this.logger.log(
      {
        input: listings.length,
        valid: validListings.length,
        invalid: listings.length - validListings.length,
      },
      'Listing validation completed'
    );

    return validListings;
  }

  private extractPropertyTypeFromUrl(url: string): string {
    const urlObj = new URL(url);
    const typeBien = urlObj.searchParams.get('typeBien');

    if (typeBien) {
      // Return first property type if multiple are specified
      return typeBien.split(',')[0] || 'APP';
    }

    return 'APP'; // Default to apartment
  }

  private extractTransactionTypeFromUrl(url: string): string {
    const urlObj = new URL(url);
    const typeTransaction = urlObj.searchParams.get('typeTransaction');

    if (typeTransaction) {
      // Return first transaction type if multiple are specified
      return typeTransaction.split(',')[0] || 'VENTE';
    }

    return 'VENTE'; // Default to sale
  }

  private logFinalStatistics(
    stats: ListingScrapingStats,
    finalListings: ListingOpportunity[]
  ): void {
    const successRate =
      stats.totalListingsFound > 0
        ? Math.round((finalListings.length / stats.totalListingsFound) * 100)
        : 0;

    const geocodingRate =
      stats.totalListingsProcessed > 0
        ? Math.round(
            (stats.geocodedListings / stats.totalListingsProcessed) * 100
          )
        : 0;

    const imagesRate =
      finalListings.length > 0
        ? Math.round((stats.listingsWithImages / finalListings.length) * 100)
        : 0;

    this.logger.log('='.repeat(60));
    this.logger.log('NOTARY SCRAPING FINAL STATISTICS');
    this.logger.log('='.repeat(60));
    this.logger.log(`🔍 Total listings found: ${stats.totalListingsFound}`);
    this.logger.log(`✅ Successfully processed: ${finalListings.length}`);
    this.logger.log(`📊 Success rate: ${successRate}%`);
    this.logger.log(
      `🗺️  Geocoded listings: ${stats.geocodedListings} (${geocodingRate}%)`
    );
    this.logger.log(
      `📷 Listings with images: ${stats.listingsWithImages} (${imagesRate}%)`
    );
    this.logger.log(
      `⏱️  Total duration: ${Math.round((stats.duration || 0) / 1000)}s`
    );
    this.logger.log(`🚫 Failed listings: ${stats.failedListings}`);
    if (stats.errors.length > 0) {
      this.logger.log(`❌ Errors encountered: ${stats.errors.length}`);
    }
    this.logger.log('='.repeat(60));
  }
}
