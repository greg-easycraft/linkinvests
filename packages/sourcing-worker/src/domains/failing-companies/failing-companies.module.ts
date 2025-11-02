import { Module } from '@nestjs/common';
import { FailingCompaniesProcessor } from './failing-companies.processor';
import { CompanyBuildingsProcessor } from './company-buildings.processor';
import { FailingCompaniesCron } from './cron/failing-companies.cron';
import { CsvParserService } from './services/csv-parser.service';
import { RechercheEntreprisesApiService } from './services/recherche-entreprises-api.service';
import { GeocodingApiService } from './services/geocoding-api.service';
import { FailingCompaniesOpportunityRepository } from './repositories';
import { BullModule } from '@nestjs/bullmq';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '@linkinvests/shared';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: SOURCE_COMPANY_BUILDINGS_QUEUE,
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
  providers: [
    FailingCompaniesProcessor,
    CompanyBuildingsProcessor,
    FailingCompaniesCron,
    CsvParserService,
    RechercheEntreprisesApiService,
    GeocodingApiService,
    FailingCompaniesOpportunityRepository,
  ],
  exports: [BullModule],
})
export class FailingCompaniesModule {}
