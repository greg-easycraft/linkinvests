import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';

import { SCRAPING_QUEUE } from '@linkinvests/shared';

@Injectable()
export class ListingsCron {
  private readonly logger = new Logger(ListingsCron.name);

  constructor(
    @InjectQueue(SCRAPING_QUEUE)
    private readonly scrapingQueue: Queue
  ) {}

  // Run daily at 3:00 AM Paris time
  // This is offset from auctions (2:00 AM) to avoid resource conflicts
  @Cron('0 3 * * *', {
    timeZone: 'Europe/Paris',
  })
  async scheduleListingsScraping(): Promise<void> {
    try {
      this.logger.log('Scheduling daily listings scraping job');

      await this.scrapingQueue.add(
        'daily-notary-listings', // Job name
        {
          jobName: 'notary-listings',
          startPage: 1,
          endPage: 50,
        }, // Job data with default pagination
        {
          // Job options
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000, // Start with 10 seconds
          },
          removeOnComplete: 100, // Keep last 100 successful jobs
          removeOnFail: 50, // Keep last 50 failed jobs
          // Priority: lower number = higher priority
          // Listings have normal priority (default is 0)
          priority: 0,
        }
      );

      this.logger.log('Daily listings scraping job scheduled successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        { error: errorMessage },
        'Failed to schedule listings scraping job'
      );

      // Don't throw error to avoid affecting other cron jobs
    }
  }

  // Optional: Manual trigger method for testing
  async triggerManualScraping(): Promise<void> {
    try {
      this.logger.log('Triggering manual listings scraping job');

      await this.scrapingQueue.add(
        'manual-notary-listings',
        {
          jobName: 'notary-listings',
          startPage: 1,
          endPage: 50,
        }, // Manual trigger with default pagination
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          priority: 1, // Higher priority for manual runs
        }
      );

      this.logger.log('Manual listings scraping job triggered successfully');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        { error: errorMessage },
        'Failed to trigger manual listings scraping job'
      );

      throw error; // Throw for manual triggers so caller knows it failed
    }
  }

  // Health check method
  async getQueueHealth(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    try {
      const waiting = await this.scrapingQueue.getWaiting();
      const active = await this.scrapingQueue.getActive();
      const completed = await this.scrapingQueue.getCompleted();
      const failed = await this.scrapingQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error({ error: errorMessage }, 'Failed to get queue health');

      throw error;
    }
  }
}
