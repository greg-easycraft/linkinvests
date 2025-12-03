import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  ListingInput,
  listingInputSchema,
  SOURCE_LISTINGS_QUEUE,
} from '@linkinvests/shared';
import { MoteurImmoService } from './services/moteur-immo.service';
import { ListingsRepository } from './repositories/listings.repository';
import { ListingJobData, ListingsJobFilters } from './types';

@Processor(SOURCE_LISTINGS_QUEUE, { concurrency: 1 })
export class ListingsProcessor extends WorkerHost {
  private readonly logger = new Logger(ListingsProcessor.name);

  constructor(
    private readonly moteurImmoService: MoteurImmoService,
    private readonly listingsRepository: ListingsRepository
  ) {
    super();
  }

  async process(job: Job<ListingJobData>): Promise<void> {
    const { source = 'moteurimmo', ...filters } = job.data;
    const startTime = Date.now();
    const filtersToUse = filters ?? ({} as ListingsJobFilters);

    this.logger.log(`Starting to process listings`, {
      jobId: job.id,
      ...filtersToUse,
    });

    const stats = {
      totalListings: 0,
      validListings: 0,
      invalidListings: 0,
      listingsInserted: 0,
      duplicatesSkipped: 0,
      errors: 0,
    };

    try {
      // Step 1: Fetch all listings from API
      this.logger.log('Step 1/3: Fetching listings from Moteur Immo API...');
      const rawListings =
        await this.moteurImmoService.getListings(filtersToUse);

      stats.totalListings = rawListings.length;
      this.logger.log(`Fetched ${rawListings.length} listings from API`);

      // Step 2: Prepare listings (already transformed and validated by service)
      this.logger.log('Step 2/3: Preparing validated listings...');
      const validatedListings = rawListings.map((listing) =>
        this.validateListing(listing)
      );

      const validListings = validatedListings.filter(Boolean) as ListingInput[];

      // Update stats
      stats.validListings = validListings.length;
      stats.invalidListings = rawListings.length - validListings.length;

      // Step 3: Insert listings into database in batches
      this.logger.log('Step 3/3: Inserting listings into database...');

      if (validListings.length > 0) {
        try {
          const insertedCount =
            await this.listingsRepository.insertListings(validListings);
          stats.listingsInserted = insertedCount;
          stats.duplicatesSkipped = validListings.length - insertedCount;
        } catch (error) {
          stats.errors++;
          this.logger.error(
            `Failed to insert listings: ${(error as Error).message}`
          );
          throw error; // Re-throw to mark job as failed
        }
      } else {
        this.logger.log('No valid listings to insert');
      }

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully processed listings for source ${source}`, {
        jobId: job.id,
      });

      // Log comprehensive statistics
      this.logger.log(`Processing stats for job ${job.id}:
        - Duration: ${duration}ms (${(duration / 1000).toFixed(1)}s)
        - Total listings fetched: ${stats.totalListings}
        - Valid listings: ${stats.validListings}
        - Invalid listings: ${stats.invalidListings}
        - Listings inserted: ${stats.listingsInserted}
        - Duplicates skipped: ${stats.duplicatesSkipped}
        - Total errors: ${stats.errors}
        - Success rate: ${stats.totalListings > 0 ? ((stats.validListings / stats.totalListings) * 100).toFixed(1) : 0}%
      `);

      // Log summary for monitoring
      this.logger.log('Job completed successfully', {
        jobId: job.id,
        source,
        duration,
        totalListings: stats.totalListings,
        validListings: stats.validListings,
        listingsInserted: stats.listingsInserted,
        duplicatesSkipped: stats.duplicatesSkipped,
        errors: stats.errors,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to process listings for source ${source} after ${duration}ms: ${(error as Error).message}`,
        {
          jobId: job.id,
          source,
          duration,
          stack: (error as Error).stack,
          stats,
        }
      );
      throw error; // Re-throw to mark job as failed and trigger retries
    }
  }

  private validateListing(listing: ListingInput): ListingInput | null {
    const result = listingInputSchema.safeParse(listing);

    if (!result.success) {
      this.logger.warn(`Invalid listing: ${JSON.stringify(result.error)}`);
      // this.logger.warn(listing);
      return null;
    }

    return result.data;
  }
}
