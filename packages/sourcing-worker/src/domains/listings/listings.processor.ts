import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SOURCE_LISTINGS_QUEUE } from '@linkinvests/shared';
import { MoteurImmoService } from './services/moteur-immo.service';
import { ListingsRepository } from './repositories/listings.repository';

interface ListingJobData {
  source?: string;
  afterDate?: string;
  beforeDate?: string;
  dpeClasses?: string[];
  propertyTypes?: string[];
  departments?: string[];
  fetchType?: 'dpe_energy_sieves' | 'recent_listings' | 'custom';
}

@Processor(SOURCE_LISTINGS_QUEUE, { concurrency: 1 })
export class ListingsProcessor extends WorkerHost {
  private readonly logger = new Logger(ListingsProcessor.name);

  constructor(
    private readonly moteurImmoService: MoteurImmoService,
    private readonly listingsRepository: ListingsRepository,
  ) {
    super();
  }

  async process(job: Job<ListingJobData>): Promise<void> {
    const {
      source = 'moteurimmo',
      afterDate,
      beforeDate,
      dpeClasses = [],
      propertyTypes = [],
      departments = [],
      fetchType = 'custom',
    } = job.data;
    const startTime = Date.now();

    const dateRangeText = beforeDate
      ? `from ${afterDate} to ${beforeDate}`
      : afterDate
        ? `since ${afterDate}`
        : 'all dates';

    this.logger.log(
      `Starting to process listings for source ${source} ${dateRangeText} (type: ${fetchType})`,
      {
        jobId: job.id,
        source,
        afterDate,
        beforeDate,
        dpeClasses,
        propertyTypes,
        departments,
        fetchType,
      },
    );

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
      const rawListings = await this.moteurImmoService.getListings({
        afterDate,
        beforeDate,
        dpeClasses: dpeClasses.length > 0 ? dpeClasses : undefined,
        propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined,
        departments: departments.length > 0 ? departments : undefined,
      });

      stats.totalListings = rawListings.length;
      this.logger.log(`Fetched ${rawListings.length} listings from API`);

      // Step 2: Prepare listings (already transformed and validated by service)
      this.logger.log('Step 2/3: Preparing validated listings...');
      const validatedListings = rawListings;

      // Update stats
      stats.validListings = rawListings.length;
      stats.invalidListings = 0;

      this.logger.log(
        `Validated ${validatedListings.length} listings (${stats.invalidListings} invalid)`,
      );

      // Step 3: Insert listings into database in batches
      this.logger.log('Step 3/3: Inserting listings into database...');

      if (validatedListings.length > 0) {
        try {
          const insertedCount =
            await this.listingsRepository.insertListings(validatedListings);
          stats.listingsInserted = insertedCount;
          stats.duplicatesSkipped = validatedListings.length - insertedCount;
        } catch (error) {
          stats.errors++;
          this.logger.error(
            `Failed to insert listings: ${(error as Error).message}`,
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
        },
      );
      throw error; // Re-throw to mark job as failed and trigger retries
    }
  }
}
