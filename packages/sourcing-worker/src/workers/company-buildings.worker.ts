import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import {
  CompanyBuildingsProcessor,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '~/domains/failing-companies';

interface CompanyBuildingsJobData {
  sourceFile: string;
}

@Injectable()
export class CompanyBuildingsWorker implements OnModuleInit {
  private readonly logger = new Logger(CompanyBuildingsWorker.name);
  private worker!: Worker;

  constructor(
    private readonly companyBuildingsProcessor: CompanyBuildingsProcessor,
  ) {}

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.worker = new Worker(
      SOURCE_COMPANY_BUILDINGS_QUEUE,
      async (job: Job<CompanyBuildingsJobData>) => {
        this.logger.log(
          `Processing job ${job.id} with sourceFile: ${job.data.sourceFile}`,
        );

        try {
          await this.companyBuildingsProcessor.process(job.data.sourceFile);
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

    this.logger.log('Company buildings worker initialized');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
