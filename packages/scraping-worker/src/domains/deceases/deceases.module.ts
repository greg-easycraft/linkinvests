import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { S3Service } from '~/storage/s3.service';
import { DeceasesScraperProcessor } from './deceases-scraper.processor';
import { InseeScraperService } from './services/insee-scraper.service';
import { FileDownloadService } from './services/file-download.service';
import { ScrapedDeceasesFilesRepository } from './repositories/scraped-deceases-files.repository';
import { SOURCE_DECEASES_SCRAPER_QUEUE } from '@linkinvests/shared';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_DECEASES_SCRAPER_QUEUE,
    }),
  ],
  providers: [
    DeceasesScraperProcessor,
    InseeScraperService,
    FileDownloadService,
    ScrapedDeceasesFilesRepository,
    S3Service,
  ],
  exports: [
    DeceasesScraperProcessor,
    InseeScraperService,
    FileDownloadService,
    ScrapedDeceasesFilesRepository,
  ],
})
export class DeceasesModule {}
