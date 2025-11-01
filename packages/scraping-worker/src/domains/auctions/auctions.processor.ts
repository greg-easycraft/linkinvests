import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { SCRAPING_QUEUE } from '@linkinvests/shared';
import type { Job } from 'bullmq';

import type { ScrapingJobData } from '~/types/scraping-job.types';
import { AuctionsOpportunityRepository } from './repositories';
import { EncheresPubliquesScraperService } from './services';

@Processor(SCRAPING_QUEUE, {
  concurrency: 1, // Process ONE job at a time
})
export class AuctionsProcessor extends WorkerHost {
  private readonly logger = new Logger(AuctionsProcessor.name);

  constructor(
    private readonly scraperService: EncheresPubliquesScraperService,
    private readonly repository: AuctionsOpportunityRepository
  ) {
    super();
  }

  async process(job: Job<ScrapingJobData>): Promise<void> {
    const { jobName, departmentId, sinceDate } = job.data;

    this.logger.log({
      jobId: job.id,
      jobName,
      departmentId,
      sinceDate,
      message: 'Starting scraping job',
    });

    // Validate job name
    if (jobName !== 'auctions') {
      const error = `Unsupported job name: ${jobName}. Only 'auctions' is supported.`;
      this.logger.error({ jobId: job.id, jobName }, error);
      throw new Error(error);
    }

    try {
      // Step 1: Scrape auction opportunities
      this.logger.log({ jobId: job.id }, 'Starting auction scraping');

      const opportunities = await this.scraperService.scrapeAuctions(
        departmentId,
        sinceDate
      );

      this.logger.log({
        jobId: job.id,
        found: opportunities.length,
        message: `Found ${opportunities.length} opportunities`,
      });

      if (opportunities.length === 0) {
        this.logger.warn({ jobId: job.id }, 'No opportunities found');
        return;
      }

      // Step 2: Collect statistics about data quality
      const geocodedCount = opportunities.filter(
        (opp) => opp.latitude !== 0 && opp.longitude !== 0
      ).length;

      const aiExtractedCount = opportunities.filter(
        (opp) =>
          opp.extraData?.price ||
          opp.extraData?.propertyType ||
          opp.extraData?.squareFootage ||
          opp.extraData?.auctionVenue
      ).length;

      const withImagesCount = opportunities.filter(
        (opp) => opp.images && opp.images.length > 0
      ).length;

      const failedGeocoding = opportunities.length - geocodedCount;

      if (failedGeocoding > 0) {
        this.logger.warn({
          jobId: job.id,
          count: failedGeocoding,
          total: opportunities.length,
          message: `${failedGeocoding}/${opportunities.length} opportunities failed geocoding`,
        });
      }

      // Step 3: Insert all opportunities (including those without coords)
      // Note: Opportunities without coordinates may fail DB insert if lat/lng are NOT NULL
      this.logger.log({
        jobId: job.id,
        count: opportunities.length,
        geocoded: geocodedCount,
        aiExtracted: aiExtractedCount,
        withImages: withImagesCount,
        message: 'Inserting opportunities into database',
      });

      const insertedCount =
        await this.repository.insertOpportunities(opportunities);

      this.logger.log({
        jobId: job.id,
        inserted: insertedCount,
        total: opportunities.length,
        geocoded: geocodedCount,
        aiExtracted: aiExtractedCount,
        withImages: withImagesCount,
        aiExtractionRate: `${Math.round((aiExtractedCount / opportunities.length) * 100)}%`,
        imageRate: `${Math.round((withImagesCount / opportunities.length) * 100)}%`,
        geocodingRate: `${Math.round((geocodedCount / opportunities.length) * 100)}%`,
        message: 'Job completed successfully',
      });
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
