import { Module } from '@nestjs/common';
import { AuctionRepository } from './lib.types';
import { DrizzleAuctionRepository } from './repositories/auction.repository';
import { AuctionService } from './services/auction.service';

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
