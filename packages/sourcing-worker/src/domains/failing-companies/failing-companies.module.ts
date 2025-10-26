import { Module } from '@nestjs/common';
import { FailingCompaniesProcessor } from './processors/failing-companies.processor';
import { CompanyBuildingsProcessor } from './processors/company-buildings.processor';
import { FailingCompaniesCron } from './cron/failing-companies.cron';

@Module({
  providers: [
    FailingCompaniesProcessor,
    CompanyBuildingsProcessor,
    FailingCompaniesCron,
  ],
  exports: [FailingCompaniesProcessor, CompanyBuildingsProcessor, FailingCompaniesCron],
})
export class FailingCompaniesModule {}
