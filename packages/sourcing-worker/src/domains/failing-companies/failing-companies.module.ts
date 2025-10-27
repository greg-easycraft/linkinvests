import { Module } from '@nestjs/common';
import { FailingCompaniesProcessor } from './failing-companies.processor';
import { CompanyBuildingsProcessor } from './company-buildings.processor';
import { FailingCompaniesCron } from './cron/failing-companies.cron';
import { CsvParserService } from './services/csv-parser.service';
import { RechercheEntreprisesApiService } from './services/recherche-entreprises-api.service';
import { GeocodingApiService } from './services/geocoding-api.service';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '@linkinvest/shared';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
      connection: redisConnection,
    }),
    BullModule.registerQueue({
      name: SOURCE_COMPANY_BUILDINGS_QUEUE,
      connection: redisConnection,
    }),
    BullBoardModule.forFeature({
      name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: SOURCE_COMPANY_BUILDINGS_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    FailingCompaniesProcessor,
    CompanyBuildingsProcessor,
    FailingCompaniesCron,
    CsvParserService,
    RechercheEntreprisesApiService,
    GeocodingApiService,
  ],
  exports: [BullModule],
})
export class FailingCompaniesModule {}
