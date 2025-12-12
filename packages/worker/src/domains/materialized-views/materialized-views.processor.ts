import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { REFRESH_MATERIALIZED_VIEW_QUEUE } from '@linkinvests/shared';
import { MaterializedViewsRepository } from './materialized-views.repository';

@Processor(REFRESH_MATERIALIZED_VIEW_QUEUE, { concurrency: 1 })
export class MaterializedViewsProcessor extends WorkerHost {
  private readonly logger = new Logger(MaterializedViewsProcessor.name);

  constructor(private readonly repository: MaterializedViewsRepository) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing materialized view refresh job ${job.id}`);

    try {
      await this.repository.refreshAllOpportunities();
      this.logger.log(`Successfully completed refresh job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to refresh materialized view: ${(error as Error).message}`,
        (error as Error).stack
      );
      throw error;
    }
  }
}
