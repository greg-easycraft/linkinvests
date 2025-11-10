import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { SCRAPING_QUEUE } from '@linkinvests/shared';
import type { Job } from 'bullmq';

import type { ScrapingJobData } from '~/types/scraping-job.types';
import { AuctionsScrapingService } from './domains/auctions';
import { DeceasesScrapingService } from './domains/deceases';

@Processor(SCRAPING_QUEUE, {
  concurrency: 1, // Process ONE job at a time
})
export class ScrapingProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    private readonly auctionsScrapingService: AuctionsScrapingService,
    private readonly deceasesScrapingService: DeceasesScrapingService
  ) {
    super();
  }

  async process(job: Job<ScrapingJobData>): Promise<void> {
    const { jobName } = job.data;

    this.logger.log({
      jobId: job.id,
      jobName,
      message: 'Scraping job requested',
    });

    try {
      if (jobName === 'auctions') {
        await this.auctionsScrapingService.scrapeAuctions(job);
        return;
      }

      if (jobName === 'deceases') {
        await this.deceasesScrapingService.scrapeDeceases(job);
        return;
      }

      const errorMsg = `Unsupported job name: ${jobName as string}. Only 'auctions' is supported.`;
      this.logger.error(errorMsg, { jobId: job.id, jobName });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error({
        jobId: job.id,
        error: errorMessage,
        stack: errorStack,
        message: 'Job failed',
      });

      throw error; // Let BullMQ handle retry logic
    }
  }
}
