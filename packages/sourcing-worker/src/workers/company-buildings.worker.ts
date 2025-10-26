import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { domainSchema } from '@repo/db';
import {
  REDIS_CONNECTION,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from '../bullmq/bullmq.module';
import { DATABASE_CONNECTION } from '../database/database.module';

interface CompanyBuildingsJobData {
  sourceFile: string;
}

@Injectable()
export class CompanyBuildingsWorker implements OnModuleInit {
  private readonly logger = new Logger(CompanyBuildingsWorker.name);
  private worker!: Worker;

  constructor(
    @Inject(REDIS_CONNECTION)
    private readonly connection: Redis,
    @Inject(DATABASE_CONNECTION)
    // @ts-expect-error - db will be used when business logic is implemented
    private readonly db: NodePgDatabase<typeof domainSchema>,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      SOURCE_COMPANY_BUILDINGS_QUEUE,
      async (job: Job<CompanyBuildingsJobData>) => {
        this.logger.log(
          `Processing job ${job.id} with sourceFile: ${job.data.sourceFile}`,
        );

        try {
          // TODO: Implement business logic for sourcing company buildings
          // This is where you would:
          // 1. Read the source file (job.data.sourceFile)
          // 2. Parse and process building data
          // 3. Transform the data as needed
          // 4. Store in database using this.db

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

    this.logger.log('Company buildings worker initialized');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
