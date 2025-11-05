import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SOURCE_DECEASES_CSV_INGEST_QUEUE } from '@linkinvests/shared';

import type { DeceasesIngestJobData } from '../types/deceases.types';

@Injectable()
export class DeceasesCron {
  private readonly logger = new Logger(DeceasesCron.name);

  constructor(
    @InjectQueue(SOURCE_DECEASES_CSV_INGEST_QUEUE)
    private readonly ingestQueue: Queue<DeceasesIngestJobData>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'monthly-deceases-csv-ingest',
    timeZone: 'Europe/Paris',
  })
  async handleMonthlyIngest(): Promise<void> {
    this.logger.log('Starting monthly deceases CSV ingest cron job');

    try {
      // Calculate current month/year for monthly file processing
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // getMonth() returns 0-11

      // Check if it's the first day of the month to process previous month's data
      const dayOfMonth = now.getDate();
      const targetYear = dayOfMonth === 1 && month === 1 ? year - 1 : year;
      const targetMonth =
        dayOfMonth === 1 ? (month === 1 ? 12 : month - 1) : month;

      this.logger.log('Calculated target date for CSV processing', {
        currentYear: year,
        currentMonth: month,
        dayOfMonth,
        targetYear,
        targetMonth,
      });

      // Enqueue CSV ingest job for scheduled processing
      const jobData: DeceasesIngestJobData = {
        year: targetYear,
        month: targetMonth,
      };

      const job = await this.ingestQueue.add('monthly-csv-ingest', jobData, {
        removeOnComplete: 100,
        removeOnFail: 100,
      });

      this.logger.log('Monthly deceases CSV ingest job enqueued', {
        jobId: job.id,
        targetYear,
        targetMonth,
      });
    } catch (error) {
      this.logger.error('Failed to enqueue monthly deceases CSV ingest', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - let cron continue on schedule
    }
  }

  /**
   * Manually trigger CSV ingest with specific S3 path
   * This method can be called programmatically for manual triggering
   */
  async triggerManualIngest(s3Path: string): Promise<string> {
    this.logger.log('Triggering manual CSV ingest', { s3Path });

    try {
      const jobData: DeceasesIngestJobData = {
        s3Path,
      };

      const job = await this.ingestQueue.add('manual-csv-ingest', jobData, {
        removeOnComplete: 100,
        removeOnFail: 100,
      });

      this.logger.log('Manual CSV ingest job enqueued', {
        jobId: job.id,
        s3Path,
      });

      return job.id as string;
    } catch (error) {
      this.logger.error('Failed to enqueue manual CSV ingest', {
        s3Path,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
