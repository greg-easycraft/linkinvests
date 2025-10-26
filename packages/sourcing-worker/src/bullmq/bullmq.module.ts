import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueService } from './queue.service';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '~/domains/failing-companies';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';

const failingCompaniesQueueProvider = {
  provide: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    return new Queue(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE, {
      connection: {
        host: new URL(redisUrl).hostname,
        port: parseInt(new URL(redisUrl).port || '6379'),
      },
    });
  },
};

const companyBuildingsQueueProvider = {
  provide: SOURCE_COMPANY_BUILDINGS_QUEUE,
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    return new Queue(SOURCE_COMPANY_BUILDINGS_QUEUE, {
      connection: {
        host: new URL(redisUrl).hostname,
        port: parseInt(new URL(redisUrl).port || '6379'),
      },
    });
  },
};

@Global()
@Module({
  providers: [
    failingCompaniesQueueProvider,
    companyBuildingsQueueProvider,
    QueueService,
  ],
  exports: [
    SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
    SOURCE_COMPANY_BUILDINGS_QUEUE,
    QueueService,
  ],
})
export class BullMQModule {}
