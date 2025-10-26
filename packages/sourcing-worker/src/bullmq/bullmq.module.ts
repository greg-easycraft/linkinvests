import { Global, Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { QueueService } from './queue.service';

export const REDIS_CONNECTION = 'REDIS_CONNECTION';
export const SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE =
  'SOURCE_FAILING_COMPANIES_REQUESTED';
export const SOURCE_COMPANY_BUILDINGS_QUEUE = 'SOURCE_COMPANY_BUILDINGS';

const redisConnectionProvider = {
  provide: REDIS_CONNECTION,
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    return new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  },
};

const failingCompaniesQueueProvider = {
  provide: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  useFactory: (connection: Redis) => {
    return new Queue(SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE, {
      connection,
    });
  },
  inject: [REDIS_CONNECTION],
};

const companyBuildingsQueueProvider = {
  provide: SOURCE_COMPANY_BUILDINGS_QUEUE,
  useFactory: (connection: Redis) => {
    return new Queue(SOURCE_COMPANY_BUILDINGS_QUEUE, {
      connection,
    });
  },
  inject: [REDIS_CONNECTION],
};

@Global()
@Module({
  providers: [
    redisConnectionProvider,
    failingCompaniesQueueProvider,
    companyBuildingsQueueProvider,
    QueueService,
  ],
  exports: [
    REDIS_CONNECTION,
    SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
    SOURCE_COMPANY_BUILDINGS_QUEUE,
    QueueService,
  ],
})
export class BullMQModule {}
