import { Module } from '@nestjs/common';
import { ListingRepository } from './lib.types';
import { ListingRepositoryImpl } from './repositories/listing.repository';
import { ListingService } from './services/listing.service';
import { ListingsController } from './listings.controller';

@Module({
  controllers: [ListingsController],
  providers: [
    {
      provide: ListingRepository,
      useClass: ListingRepositoryImpl,
    },
    ListingService,
  ],
  exports: [ListingService, ListingRepository],
})
export class ListingsModule {}
