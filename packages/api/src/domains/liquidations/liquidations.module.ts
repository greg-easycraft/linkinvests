import { Module } from '@nestjs/common';
import { LiquidationRepository } from './lib.types.js';
import { DrizzleLiquidationRepository } from './repositories/liquidation.repository.js';
import { LiquidationService } from './services/liquidation.service.js';

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
