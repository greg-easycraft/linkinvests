import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';

import { AuctionsProcessor } from './auctions.processor';
import { AuctionsCron } from './cron/auctions.cron';
import { AuctionsOpportunityRepository } from './repositories';
import {
  AiExtractionService,
  BrowserService,
  DetailScraperService,
  EncheresPubliquesScraperService,
  GeocodingService,
  ListingExtractorService,
} from './services';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCRAPING_QUEUE,
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
  providers: [
    AuctionsProcessor,
    AuctionsCron,
    AuctionsOpportunityRepository,
    EncheresPubliquesScraperService,
    BrowserService,
    GeocodingService,
    AiExtractionService,
    ListingExtractorService,
    DetailScraperService,
  ],
  exports: [BullModule],
})
export class AuctionsModule {}
