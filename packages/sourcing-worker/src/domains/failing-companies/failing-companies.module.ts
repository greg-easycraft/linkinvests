import { Module } from '@nestjs/common';
import { FailingCompaniesProcessor } from './processors/failing-companies.processor';
import { CompanyBuildingsProcessor } from './processors/company-buildings.processor';

@Module({
  providers: [FailingCompaniesProcessor, CompanyBuildingsProcessor],
  exports: [FailingCompaniesProcessor, CompanyBuildingsProcessor],
})
export class FailingCompaniesModule {}
