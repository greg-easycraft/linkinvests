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
    @InjectQueue(SCRAPING_QUEUE)
    private readonly queue: Queue<ScrapingJobData>
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-auction-scraping',
    timeZone: 'Europe/Paris',
  })
  async handleDailyAuctionScraping(): Promise<void> {
    this.logger.log('Starting daily auction scraping for all departments');

    try {
      await this.queue.add(
        'auctions',
        {
          jobName: 'auctions',
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

      this.logger.debug(`Enqueued auction job`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        { error: errorMessage },
        `Failed to enqueue auction job`
      );
    }
  }
}
