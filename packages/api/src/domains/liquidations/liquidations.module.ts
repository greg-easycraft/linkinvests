import { Module } from '@nestjs/common';
import { LiquidationRepository } from './lib.types';
import { LiquidationRepositoryImpl } from './repositories/liquidation.repository';
import { LiquidationService } from './services/liquidation.service';
import { LiquidationsController } from './liquidations.controller';

@Module({
  controllers: [LiquidationsController],
  providers: [
    {
      provide: LiquidationRepository,
      useClass: LiquidationRepositoryImpl,
    },
    LiquidationService,
  ],
  exports: [LiquidationService, LiquidationRepository],
})
export class LiquidationsModule {}
