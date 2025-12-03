import { Module } from '@nestjs/common';
import { AuctionRepository } from './lib.types';
import { DrizzleAuctionRepository } from './repositories/auction.repository';
import { AuctionService } from './services/auction.service';
import { AuctionsController } from './auctions.controller';

@Module({
  controllers: [AuctionsController],
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
