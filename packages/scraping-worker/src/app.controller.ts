import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { SCRAPING_QUEUE } from '@linkinvests/shared';
import type { Queue } from 'bullmq';

import type { ScrapingJobData } from './types/scraping-job.types';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectQueue(SCRAPING_QUEUE)
    private readonly scrapingQueue: Queue
  ) {}

  @Post('jobs/auctions')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueAuctionJob(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate?: string
  ) {
    try {
      // Validation
      if (!departmentId) {
        return {
          success: false,
          error: 'departmentId is required',
        };
      }

      if (
        typeof departmentId !== 'number' ||
        departmentId < 1 ||
        departmentId > 95
      ) {
        return {
          success: false,
          error: 'departmentId must be a number between 1 and 95',
        };
      }

      if (sinceDate && !/^\d{4}-\d{2}-\d{2}$/.test(sinceDate)) {
        return {
          success: false,
          error: 'sinceDate must be in ISO format YYYY-MM-DD',
        };
      }

      // Enqueue job
      const jobData: ScrapingJobData = {
        jobName: 'auctions',
        departmentId,
        sinceDate:
          sinceDate || (new Date().toISOString().split('T')[0] as string),
      };

      const { id: jobId } = await this.scrapingQueue.add(
        'scrape-auctions',
        jobData,
        {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
        }
      );

      this.logger.log({
        jobId,
        departmentId,
        sinceDate,
        message: 'Auction scraping job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Auction scraping job enqueued successfully',
        data: jobData,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        stack: err.stack,
        message: 'Failed to enqueue auction job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }
}
