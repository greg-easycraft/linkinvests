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

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCRAPING_QUEUE,
      connection: redisConnection,
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
