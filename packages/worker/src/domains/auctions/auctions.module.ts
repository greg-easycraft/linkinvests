import { Module } from '@nestjs/common';

import { AuctionsCron } from './cron/auctions.cron';
import { AuctionsOpportunityRepository } from './repositories';
import {
  BrowserService,
  DetailScraperService,
  EncheresPubliquesScraperService,
  ListingExtractorService,
  AuctionsGeocodingService,
  AuctionsScrapingService,
  AbstractAuctionsRepository,
  AIAddressService,
} from './services';
import { BullModule } from '@nestjs/bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';
import { config } from '~/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SCRAPING_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [
    {
      provide: AbstractAuctionsRepository,
      useClass: AuctionsOpportunityRepository,
    },
    AuctionsScrapingService,
    AuctionsCron,
    EncheresPubliquesScraperService,
    BrowserService,
    ListingExtractorService,
    DetailScraperService,
    AuctionsGeocodingService,
    AIAddressService,
  ],
  exports: [AuctionsScrapingService],
})
export class AuctionsModule {}
