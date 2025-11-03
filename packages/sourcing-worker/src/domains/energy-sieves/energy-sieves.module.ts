import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvests/shared';
import { EnergySievesProcessor } from './energy-sieves.processor';
import { AdemeApiService } from './services';
import { EnergySievesOpportunityRepository } from './repositories';
import { EnergySievesCron } from './cron/energy-sieves.cron';
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
    EnergySievesProcessor,
    AdemeApiService,
    EnergySievesOpportunityRepository,
    EnergySievesCron,
  ],
  exports: [BullModule],
})
export class EnergySievesModule {}
