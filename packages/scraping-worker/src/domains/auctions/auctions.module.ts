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
} from './services';

@Module({
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
  ],
  exports: [AuctionsScrapingService],
})
export class AuctionsModule {}
