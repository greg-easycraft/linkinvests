import { Module } from '@nestjs/common';
import { SavedSearchRepository } from './lib.types';
import { SavedSearchRepositoryImpl } from './repositories/saved-searches.repository';
import { SavedSearchService } from './services/saved-searches.service';
import { SavedSearchesController } from './saved-searches.controller';

@Module({
  controllers: [SavedSearchesController],
  providers: [
    {
      provide: SavedSearchRepository,
      useClass: SavedSearchRepositoryImpl,
    },
    SavedSearchService,
  ],
  exports: [SavedSearchService, SavedSearchRepository],
})
export class SavedSearchesModule {}
