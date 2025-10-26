import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import {
  REDIS_CONNECTION,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
} from '../bullmq/bullmq.module';
import { FailingCompaniesProcessor } from '../domains/failing-companies/processors/failing-companies.processor';

@Injectable()
export class FailingCompaniesWorker implements OnModuleInit {
  private readonly logger = new Logger(FailingCompaniesWorker.name);
  private worker!: Worker;

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly connection: Redis,
    private readonly failingCompaniesProcessor: FailingCompaniesProcessor,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
      async (job: Job) => {
        this.logger.log(`Processing job ${job.id}`);

        try {
          await this.failingCompaniesProcessor.process();
          this.logger.log(`Job ${job.id} completed successfully`);
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
          throw error;
        }
      },
      {
        connection: this.connection,
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
