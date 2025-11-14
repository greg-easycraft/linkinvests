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

import type { ScrapingJobData } from '../types/scraping-job.types';

@Controller('scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(
    @InjectQueue(SCRAPING_QUEUE)
    private readonly scrapingQueue: Queue,
  ) {}

  @Post('jobs/auctions')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueAuctionJob(
    @Body('departmentId') departmentId: number,
    @Body('sinceDate') sinceDate?: string,
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
        departmentId > 98
      ) {
        return {
          success: false,
          error: 'departmentId must be a number between 1 and 98',
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
        sinceDate: sinceDate || new Date().toISOString().split('T')[0],
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
        },
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

  @Post('jobs/notary-listings')
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueNotaryListingsJob(
    @Body('startPage') startPage?: number,
    @Body('endPage') endPage?: number,
  ) {
    try {
      const result = this.getValidatedPageRange(startPage, endPage);
      if (!result.valid) {
        return {
          success: false,
          error: result.error,
        };
      }
      // Validation with defaults

      // Enqueue job
      const jobData: ScrapingJobData = {
        jobName: 'notary-listings',
        startPage: result.startPage,
        endPage: result.endPage,
      };

      const { id: jobId } = await this.scrapingQueue.add(
        'scrape-notary-listings',
        jobData,
        {
          removeOnComplete: 100,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
        },
      );

      this.logger.log({
        jobId,
        startPage: result.startPage,
        endPage: result.endPage,
        totalPages: result.endPage - result.startPage + 1,
        message: 'Notary listings scraping job enqueued',
      });

      return {
        success: true,
        jobId,
        message: 'Notary listings scraping job enqueued successfully',
        data: jobData,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error({
        error: err.message,
        stack: err.stack,
        message: 'Failed to enqueue notary listings job',
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  private getValidatedPageRange(
    startPage?: number,
    endPage?: number,
  ):
    | { valid: false; error: string }
    | { valid: true; startPage: number; endPage: number } {
    const validatedStartPage = startPage ?? 1;
    const validatedEndPage = endPage ?? 50;

    // Validate page numbers
    if (typeof validatedStartPage !== 'number' || validatedStartPage < 1) {
      return {
        valid: false,
        error: 'startPage must be a number greater than 0',
      };
    }

    if (typeof validatedEndPage !== 'number' || validatedEndPage < 1) {
      return {
        valid: false,
        error: 'endPage must be a number greater than 0',
      };
    }

    if (validatedStartPage > validatedEndPage) {
      return {
        valid: false,
        error: 'startPage must be less than or equal to endPage',
      };
    }

    if (validatedEndPage - validatedStartPage + 1 > 100) {
      return {
        valid: false,
        error:
          'Page range cannot exceed 100 pages (current range: ' +
          (validatedEndPage - validatedStartPage + 1) +
          ' pages)',
      };
    }

    return {
      valid: true,
      startPage: validatedStartPage,
      endPage: validatedEndPage,
    };
  }
}
