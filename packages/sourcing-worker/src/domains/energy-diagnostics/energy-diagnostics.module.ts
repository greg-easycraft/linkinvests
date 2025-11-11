import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvests/shared';
import { EnergyDiagnosticsProcessor } from './energy-diagnostics.processor';
import { AdemeApiService } from './services';
import { EnergyDiagnosticsOpportunityRepository } from './repositories';
import { EnergyDiagnosticsCron } from './cron/energy-sieves.cron';
import { config } from '~/config';

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
    EnergyDiagnosticsProcessor,
    AdemeApiService,
    EnergyDiagnosticsOpportunityRepository,
    EnergyDiagnosticsCron,
  ],
  exports: [BullModule],
})
export class EnergyDiagnosticsModule {}
