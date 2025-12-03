import { Module } from '@nestjs/common';
import { ListingRepository } from './lib.types';
import { DrizzleListingRepository } from './repositories/listing.repository';
import { ListingService } from './services/listing.service';

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
