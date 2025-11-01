import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';

import type { ScrapingJobData } from '~/types/scraping-job.types';

/**
 * Cron job to schedule daily auction scraping for all French departments
 * Runs at 2 AM Paris time every day
 */
@Injectable()
export class AuctionsCron {
  private readonly logger = new Logger(AuctionsCron.name);

  constructor(
    @InjectQueue(SCRAPING_QUEUE) private readonly queue: Queue<ScrapingJobData>
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-auction-scraping',
    timeZone: 'Europe/Paris',
  })
  async handleDailyAuctionScraping(): Promise<void> {
    this.logger.log('Starting daily auction scraping for all departments');

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // Loop through all French departments (1-95)
    // Note: Department 20 (Corse) was split into 2A and 2B, so we skip it
    const departments = Array.from({ length: 95 }, (_, i) => i + 1).filter(
      (id) => id !== 20
    );

    for (const departmentId of departments) {
      try {
        await this.queue.add(
          'auctions',
          {
            jobName: 'auctions',
            departmentId,
            // No sinceDate - scrape all current/upcoming auctions
          },
          {
            // Job options
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000, // 5 seconds initial delay
            },
            removeOnComplete: {
              age: 7 * 24 * 3600, // Keep completed jobs for 7 days
              count: 100, // Keep last 100 completed jobs
            },
            removeOnFail: {
              age: 30 * 24 * 3600, // Keep failed jobs for 30 days
            },
          }
        );

        successCount++;
        this.logger.debug(
          { departmentId },
          `Enqueued auction job for department ${departmentId}`
        );
      } catch (error: unknown) {
        failCount++;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          { departmentId, error: errorMessage },
          `Failed to enqueue auction job for department ${departmentId}`
        );
        // Continue with next department even if one fails
      }
    }

    const duration = Date.now() - startTime;

    this.logger.log({
      total: departments.length,
      success: successCount,
      failed: failCount,
      durationMs: duration,
      message: `Daily auction scraping jobs enqueued: ${successCount}/${departments.length} successful`,
    });
  }
}
