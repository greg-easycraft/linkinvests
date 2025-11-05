import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  SOURCE_DECEASES_CSV_INGEST_QUEUE,
  SOURCE_DECEASES_CSV_PROCESS_QUEUE,
} from '@linkinvests/shared';

import { DeceasesCron } from './cron';
import { DeceasesIngestProcessor } from './deceases-ingest.processor';
import { DeceasesCsvProcessor } from './deceases-csv.processor';
import { DeceasesOpportunityRepository } from './repositories';
import { InseeApiService, CsvParsingService } from './services';
import { config } from '~/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_DECEASES_CSV_INGEST_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: SOURCE_DECEASES_CSV_PROCESS_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [
    DeceasesIngestProcessor,
    DeceasesCsvProcessor,
    InseeApiService,
    CsvParsingService,
    DeceasesOpportunityRepository,
    DeceasesCron,
  ],
  exports: [BullModule],
})
export class DeceasesModule {}
