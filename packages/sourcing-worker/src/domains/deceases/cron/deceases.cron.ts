import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SOURCE_DECEASES_QUEUE } from '@linkinvests/shared';

import type { DeceasesJobData } from '../types/deceases.types';

@Injectable()
export class DeceasesCron {
  private readonly logger = new Logger(DeceasesCron.name);

  constructor(
    @InjectQueue(SOURCE_DECEASES_QUEUE)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'daily-deceases-import',
    timeZone: 'Europe/Paris',
  })
  async handleDailyImport(): Promise<void> {
    this.logger.log('Starting daily deceases import cron job');

    try {
      // Calculate date range (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const sinceDate = yesterday.toISOString().split('T')[0];

      // Enqueue job
      const jobData: DeceasesJobData = {
        sinceDate,
      };

      const job = await this.queue.add('daily-import', jobData, {
        removeOnComplete: 100,
        removeOnFail: 100,
      });

      this.logger.log({
        jobId: job.id,
        sinceDate,
        message: 'Daily deceases import job enqueued',
      });
    } catch (error) {
      this.logger.error({
        error: (error as Error).message,
        message: 'Failed to enqueue daily deceases import',
      });
      // Don't throw - let cron continue on schedule
    }
  }
}
