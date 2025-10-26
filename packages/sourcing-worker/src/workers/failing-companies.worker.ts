import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import {
  FailingCompaniesProcessor,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  type FailingCompaniesJobData,
} from '~/domains/failing-companies';

@Injectable()
export class FailingCompaniesWorker implements OnModuleInit {
  private readonly logger = new Logger(FailingCompaniesWorker.name);
  private worker!: Worker;

  constructor(
    private readonly failingCompaniesProcessor: FailingCompaniesProcessor,
  ) {}

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.worker = new Worker(
      SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
      async (job: Job<FailingCompaniesJobData>) => {
        this.logger.log(
          `Processing job ${job.id} for department ${job.data.departmentId} since ${job.data.sinceDate}`,
        );

        try {
          await this.failingCompaniesProcessor.process(
            job.data.departmentId,
            job.data.sinceDate,
          );
          this.logger.log(`Job ${job.id} completed successfully`);
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
          throw error;
        }
      },
      {
        connection: {
          host: new URL(redisUrl).hostname,
          port: parseInt(new URL(redisUrl).port || '6379'),
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} has been completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} has failed: ${err.message}`);
    });

    this.logger.log('Failing companies worker initialized');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
