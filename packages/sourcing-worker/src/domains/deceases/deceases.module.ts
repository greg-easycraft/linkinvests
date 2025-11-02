import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_DECEASES_QUEUE } from '@linkinvests/shared';

import { DeceasesCron } from './cron';
import { DeceasesProcessor } from './deceases.processor';
import { DeceasesOpportunityRepository } from './repositories';
import { InseeApiService } from './services';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_DECEASES_QUEUE,
      connection: redisConnection,
    }),
  ],
  providers: [
    DeceasesProcessor,
    InseeApiService,
    DeceasesOpportunityRepository,
    DeceasesCron,
  ],
  exports: [BullModule],
})
export class DeceasesModule {}
