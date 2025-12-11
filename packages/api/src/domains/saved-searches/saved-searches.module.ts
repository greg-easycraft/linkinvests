import { Module } from '@nestjs/common';
import { SavedSearchRepository } from './lib.types';
import { DrizzleSavedSearchRepository } from './repositories/saved-searches.repository';
import { SavedSearchService } from './services/saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';

@Module({
  controllers: [SavedSearchesController],
  providers: [
    {
      provide: SavedSearchRepository,
      useClass: DrizzleSavedSearchRepository,
    },
    SavedSearchService,
  ],
  exports: [SavedSearchService, SavedSearchRepository],
})
export class SavedSearchesModule {}
