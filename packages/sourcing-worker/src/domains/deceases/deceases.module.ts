import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { INGEST_DECEASES_CSV_QUEUE } from '@linkinvests/shared';

import { DeceasesCron } from './cron';
import { DeceasesCsvProcessor } from './deceases-csv.processor';
import { DeceasesOpportunityRepository } from './repositories';
import { InseeApiService, CsvParsingService } from './services';
import { config } from '~/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: INGEST_DECEASES_CSV_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [
    DeceasesCsvProcessor,
    InseeApiService,
    CsvParsingService,
    DeceasesOpportunityRepository,
    DeceasesCron,
  ],
  exports: [BullModule],
})
export class DeceasesModule {}
