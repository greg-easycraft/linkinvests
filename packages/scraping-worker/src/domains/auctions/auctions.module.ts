import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { SCRAPING_QUEUE } from '@linkinvests/shared';

import { AuctionsProcessor } from './auctions.processor';
import { AuctionsOpportunityRepository } from './repositories';
import {
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
    BullBoardModule.forFeature({
      name: SCRAPING_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    AuctionsProcessor,
    AuctionsOpportunityRepository,
    EncheresPubliquesScraperService,
    BrowserService,
    GeocodingService,
    ListingExtractorService,
    DetailScraperService,
  ],
  exports: [BullModule],
})
export class AuctionsModule {}
