import { Module } from '@nestjs/common';
import { ListingRepository } from './lib.types.js';
import { DrizzleListingRepository } from './repositories/listing.repository.js';
import { ListingService } from './services/listing.service.js';

@Module({
  providers: [
    {
      provide: ListingRepository,
      useClass: DrizzleListingRepository,
    },
    ListingService,
  ],
  exports: [ListingService, ListingRepository],
})
export class ListingsModule {}
