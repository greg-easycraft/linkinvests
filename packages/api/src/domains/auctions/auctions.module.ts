import { Module } from '@nestjs/common';
import { AuctionRepository } from './lib.types.js';
import { DrizzleAuctionRepository } from './repositories/auction.repository.js';
import { AuctionService } from './services/auction.service.js';

@Module({
  providers: [
    {
      provide: AuctionRepository,
      useClass: DrizzleAuctionRepository,
    },
    AuctionService,
  ],
  exports: [AuctionService, AuctionRepository],
})
export class AuctionsModule {}
