import { Module } from '@nestjs/common';
import { FailingCompaniesWorker } from './failing-companies.worker';
import { CompanyBuildingsWorker } from './company-buildings.worker';

@Module({
  providers: [FailingCompaniesWorker, CompanyBuildingsWorker],
})
export class WorkerModule {}
