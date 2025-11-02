import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvests/shared';
import { EnergySievesProcessor } from './energy-sieves.processor';
import { AdemeApiService } from './services';
import { EnergySievesOpportunityRepository } from './repositories';
import { EnergySievesCron } from './cron/energy-sieves.cron';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_ENERGY_SIEVES_QUEUE,
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
  providers: [
    EnergySievesProcessor,
    AdemeApiService,
    EnergySievesOpportunityRepository,
    EnergySievesCron,
  ],
  exports: [BullModule],
})
export class EnergySievesModule {}
