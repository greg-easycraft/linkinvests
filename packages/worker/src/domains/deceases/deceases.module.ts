import { Module } from '@nestjs/common';
import {
  InseeScraperService,
  FileDownloadService,
  DeceasesScrapingService,
} from './services';
import {
  ScrapedDeceasesFilesRepositoryImpl,
  DeceasesOpportunityRepositoryImpl,
} from './repositories';
import {
  DeceasesOpportunityRepository,
  ScrapedDeceasesFilesRepository,
} from './types';

@Module({
  providers: [
    {
      provide: ScrapedDeceasesFilesRepository,
      useClass: ScrapedDeceasesFilesRepositoryImpl,
    },
    {
      provide: DeceasesOpportunityRepository,
      useClass: DeceasesOpportunityRepositoryImpl,
    },
    DeceasesScrapingService,
    InseeScraperService,
    FileDownloadService,
  ],
  exports: [DeceasesScrapingService],
})
export class DeceasesModule {}
