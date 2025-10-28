import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvest/shared';
import { EnergySievesProcessor } from './energy-sieves.processor';
import { AdemeApiService } from './services';
import { EnergySievesOpportunityRepository } from './repositories';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_ENERGY_SIEVES_QUEUE,
      connection: redisConnection,
    }),
  ],
  providers: [
    EnergySievesProcessor,
    AdemeApiService,
    EnergySievesOpportunityRepository,
  ],
  exports: [BullModule],
})
export class EnergySievesModule {}
