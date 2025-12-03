import { Module } from '@nestjs/common';

import { S3Service } from '~/storage/s3.service';
import {
  InseeScraperService,
  FileDownloadService,
  DeceasesScrapingService,
  AbstractDeceasesRepository,
} from './services';
import { ScrapedDeceasesFilesRepository } from './repositories/scraped-deceases-files.repository';

@Module({
  providers: [
    {
      provide: AbstractDeceasesRepository,
      useClass: ScrapedDeceasesFilesRepository,
    },
    DeceasesScrapingService,
    InseeScraperService,
    FileDownloadService,
    ScrapedDeceasesFilesRepository,
    S3Service,
  ],
  exports: [DeceasesScrapingService],
})
export class DeceasesModule {}
