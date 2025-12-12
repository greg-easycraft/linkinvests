import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { REFRESH_MATERIALIZED_VIEW_QUEUE } from '@linkinvests/shared';

const REFRESH_JOB_ID = 'refresh-all-opportunities';
const REFRESH_DELAY_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class RefreshTriggerService {
  private readonly logger = new Logger(RefreshTriggerService.name);

  constructor(
    @InjectQueue(REFRESH_MATERIALIZED_VIEW_QUEUE)
    private readonly refreshQueue: Queue
  ) {}

  async triggerRefresh(): Promise<void> {
    // Remove any existing pending refresh job (debounce)
    const existingJob = await this.refreshQueue.getJob(REFRESH_JOB_ID);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'delayed' || state === 'waiting') {
        await existingJob.remove();
        this.logger.debug('Removed existing pending refresh job');
      }
    }

    // Add new delayed refresh job
    await this.refreshQueue.add(
      'refresh-materialized-view',
      {},
      {
        jobId: REFRESH_JOB_ID,
        delay: REFRESH_DELAY_MS,
        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );

    this.logger.debug(
      `Scheduled materialized view refresh in ${REFRESH_DELAY_MS / 1000}s`
    );
  }
}
