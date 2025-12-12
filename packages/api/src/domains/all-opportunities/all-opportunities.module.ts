import { Module } from '@nestjs/common';
import { AllOpportunitiesRepository } from './lib.types';
import { AllOpportunitiesRepositoryImpl } from './repositories/all-opportunities.repository';
import { AllOpportunitiesService } from './services/all-opportunities.service';
import { AllOpportunitiesController } from './all-opportunities.controller';

@Module({
  providers: [
    {
      provide: AllOpportunitiesRepository,
      useClass: AllOpportunitiesRepositoryImpl,
    },
    AllOpportunitiesService,
  ],
  controllers: [AllOpportunitiesController],
})
export class AllOpportunitiesModule {}
