import { Module } from '@nestjs/common';
import { AuctionRepository } from './lib.types';
import { AuctionRepositoryImpl } from './repositories/auction.repository';
import { AuctionService } from './services/auction.service';
import { AuctionsController } from './auctions.controller';

@Module({
  providers: [
    {
      provide: AuctionRepository,
      useClass: AuctionRepositoryImpl,
    },
    AuctionService,
  ],
  controllers: [AuctionsController],
})
export class AuctionsModule {}
