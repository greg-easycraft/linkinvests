import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvests/shared';
import { EnergyDiagnosticsProcessor } from './energy-diagnostics.processor';
import { AdemeApiService } from './services';
import { DrizzleEnergyDiagnosticsRepository } from './repositories';
import { EnergyDiagnosticsCron } from './cron/energy-sieves.cron';
import { config } from '~/config';
import { EnergyDiagnosticsRepository } from './types';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_ENERGY_SIEVES_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [
    {
      provide: EnergyDiagnosticsRepository,
      useClass: DrizzleEnergyDiagnosticsRepository,
    },
    AdemeApiService,
    EnergyDiagnosticsProcessor,
    EnergyDiagnosticsCron,
  ],
  exports: [BullModule],
})
export class EnergyDiagnosticsModule {}
