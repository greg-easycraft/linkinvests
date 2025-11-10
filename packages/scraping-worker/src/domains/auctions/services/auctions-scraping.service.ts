import { Injectable, Logger } from '@nestjs/common';
import type { AuctionOpportunity } from '../types/auctions.types';
import type { Job } from 'bullmq';

import { EncheresPubliquesScraperService } from './encheres-publiques-scraper.service';

export abstract class AbstractAuctionsRepository {
  abstract insertOpportunities(
    opportunities: AuctionOpportunity[]
  ): Promise<number>;
}

@Injectable()
export class AuctionsScrapingService {
  private readonly logger = new Logger(AuctionsScrapingService.name);

  constructor(
    private readonly scraperService: EncheresPubliquesScraperService,
    private readonly repository: AbstractAuctionsRepository
  ) {}

  async scrapeAuctions(job: Job): Promise<void> {
    this.logger.log('Starting auctions scraping job', {
      jobId: job.id,
    });

    const opportunities = await this.scraperService.scrapeAuctions();

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

    this.logger.log('Auctions scraping job completed successfully', {
      jobId: job.id,
      inserted: insertedCount,
      total: opportunities.length,
      geocoded: geocodedCount,
      aiExtracted: aiExtractedCount,
      withImages: withImagesCount,
      aiExtractionRate: `${Math.round((aiExtractedCount / opportunities.length) * 100)}%`,
      imageRate: `${Math.round((withImagesCount / opportunities.length) * 100)}%`,
      geocodingRate: `${Math.round((geocodedCount / opportunities.length) * 100)}%`,
    });
  }
}
