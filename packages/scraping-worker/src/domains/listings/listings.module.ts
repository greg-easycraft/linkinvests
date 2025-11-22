import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// Services
import { ListingsScrapingService } from './services/listings-scraping.service.js';
import { NotaryScraperService } from './services/notary-scraper.service.js';
import { BrowserService } from './services/browser.service.js';
import { ListingExtractorService } from './services/listing-extractor.service.js';
import { DetailScraperService } from './services/detail-scraper.service.js';
import { ListingsGeocodingService } from './services/geocoding.service.js';

// Repositories
import { ListingsOpportunityRepository } from './repositories/listings-opportunity.repository.js';

// Cron jobs
// import { ListingsCron } from './cron/listings.cron.js';

// Queue constants
import { SCRAPING_QUEUE } from '@linkinvests/shared';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCRAPING_QUEUE,
    }),
  ],
  providers: [
    // Main orchestration service
    ListingsScrapingService,

    // Core scraping services
    NotaryScraperService,
    BrowserService,
    ListingExtractorService,
    DetailScraperService,
    ListingsGeocodingService,

    // Data access
    ListingsOpportunityRepository,

    // Scheduled jobs
    // ListingsCron,
  ],
  exports: [
    // Export main service for processor
    ListingsScrapingService,
  ],
})
export class ListingsModule { }
