import { Module } from '@nestjs/common';
import { FailingCompaniesWorker } from './failing-companies.worker';
import { CompanyBuildingsWorker } from './company-buildings.worker';
import { FailingCompaniesModule } from '../domains/failing-companies/failing-companies.module';
import { BullMQModule } from '../bullmq/bullmq.module';

@Module({
  imports: [BullMQModule, FailingCompaniesModule],
  providers: [FailingCompaniesWorker, CompanyBuildingsWorker],
})
export class WorkerModule {}
