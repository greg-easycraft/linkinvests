import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { EncheresPubliquesScraperService } from './encheres-publiques-scraper.service';
import { AuctionInput } from '@linkinvests/shared';

export abstract class AbstractAuctionsRepository {
  abstract insertOpportunities(opportunities: AuctionInput[]): Promise<number>;
  abstract getAllExternalIds(): Promise<string[]>;
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

    const existingExternalIds = await this.repository.getAllExternalIds();

    const auctions = await this.scraperService.scrapeAuctions(
      new Set(existingExternalIds)
    );

    this.logger.log({
      jobId: job.id,
      found: auctions.length,
      message: `Found ${auctions.length} auctions`,
    });

    if (auctions.length === 0) {
      this.logger.warn({ jobId: job.id }, 'No auctions found');
      return;
    }

    // Step 2: Collect statistics about data quality
    const geocodedCount = auctions.filter(
      (opp) => opp.latitude !== 0 && opp.longitude !== 0
    ).length;

    const withImagesCount = auctions.filter(
      (opp) => opp.mainPicture && opp.pictures && opp.pictures.length > 0
    ).length;

    const failedGeocoding = auctions.length - geocodedCount;

    if (failedGeocoding > 0) {
      this.logger.warn({
        jobId: job.id,
        count: failedGeocoding,
        total: auctions.length,
        message: `${failedGeocoding}/${auctions.length} auctions failed geocoding`,
      });
    }

    // Step 3: Insert all auctions (including those without coords)
    // Note: Opportunities without coordinates may fail DB insert if lat/lng are NOT NULL
    this.logger.log({
      jobId: job.id,
      count: auctions.length,
      geocoded: geocodedCount,
      withImages: withImagesCount,
      message: 'Inserting auctions into database',
    });

    const insertedCount = await this.repository.insertOpportunities(auctions);

    this.logger.log('Auctions scraping job completed successfully', {
      jobId: job.id,
      inserted: insertedCount,
      total: auctions.length,
      geocoded: geocodedCount,
      withImages: withImagesCount,
      imageRate: `${Math.round((withImagesCount / auctions.length) * 100)}%`,
      geocodingRate: `${Math.round((geocodedCount / auctions.length) * 100)}%`,
    });
  }
}
