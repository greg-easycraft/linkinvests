import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_DECEASES_QUEUE } from '@linkinvests/shared';

import { DeceasesCron } from './cron';
import { DeceasesProcessor } from './deceases.processor';
import { DeceasesOpportunityRepository } from './repositories';
import { InseeApiService } from './services';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_DECEASES_QUEUE,
      connection: {
        url: process.env.REDIS_URL,
      },
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
