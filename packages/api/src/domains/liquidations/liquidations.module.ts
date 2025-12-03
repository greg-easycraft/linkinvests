import { Module } from '@nestjs/common';
import { LiquidationRepository } from './lib.types';
import { DrizzleLiquidationRepository } from './repositories/liquidation.repository';
import { LiquidationService } from './services/liquidation.service';

@Module({
  providers: [
    {
      provide: LiquidationRepository,
      useClass: DrizzleLiquidationRepository,
    },
    LiquidationService,
  ],
  exports: [LiquidationService, LiquidationRepository],
})
export class LiquidationsModule {}
