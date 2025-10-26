import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '~/domains/failing-companies';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE)
    private readonly failingCompaniesQueue: Queue,
    @Inject(SOURCE_COMPANY_BUILDINGS_QUEUE)
    private readonly companyBuildingsQueue: Queue,
  ) {}

  async sourceFailingCompanies(): Promise<string> {
    const job = await this.failingCompaniesQueue.add(
      'source-failing-companies',
      {},
      {
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );

    this.logger.log(`Enqueued failing companies job: ${job.id}`);
    return job.id as string;
  }

  async sourceCompanyBuildings(sourceFile: string): Promise<string> {
    const job = await this.companyBuildingsQueue.add(
      'source-company-buildings',
      { sourceFile },
      {
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );

    this.logger.log(
      `Enqueued company buildings job: ${job.id} with sourceFile: ${sourceFile}`,
    );
    return job.id as string;
  }
}
