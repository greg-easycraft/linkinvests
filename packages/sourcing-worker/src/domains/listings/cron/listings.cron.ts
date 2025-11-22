import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SOURCE_LISTINGS_QUEUE } from '@linkinvests/shared';
import { subMonths, format } from 'date-fns';

interface ListingJobData {
  source?: string;
  afterDate?: string;
  beforeDate?: string;
  energyClassClasses?: string[];
  propertyTypes?: string[];
  departments?: string[];
  fetchType?: 'energyClass_energy_sieves' | 'recent_listings' | 'custom';
}

@Injectable()
export class ListingsCron {
  private readonly logger = new Logger(ListingsCron.name);

  constructor(
    @InjectQueue(SOURCE_LISTINGS_QUEUE)
    private readonly queue: Queue,
  ) {}

  /**
   * Daily job to fetch recent listings (last 3 months)
   * Focus on "ancien" properties with any DPE class
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-recent-listings-import',
    timeZone: 'Europe/Paris',
  })
  async handleDailyRecentListings(): Promise<void> {
    this.logger.log('Starting daily recent listings import cron job');

    try {
      const today = new Date();
      const threeMonthsAgo = subMonths(today, 3);
      const afterDate = format(threeMonthsAgo, 'yyyy-MM-dd');

      const jobData: ListingJobData = {
        source: 'moteurimmo',
        afterDate,
        propertyTypes: ['ancien'], // Focus on existing/old properties
        fetchType: 'recent_listings',
      };

      const job = await this.queue.add('fetch-recent-listings', jobData, {
        removeOnComplete: 10,
        removeOnFail: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      this.logger.log(
        `Enqueued recent listings job ${job.id} for listings since ${afterDate}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue daily recent listings job: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw - let cron continue on schedule
    }
  }

  /**
   * Weekly job to fetch DPE energy sieves (last 24 months)
   * Focus on properties with poor energy classes (E, F, G) and "ancien" type
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weekly-energyClass-energy-sieves-import',
    timeZone: 'Europe/Paris',
  })
  async handleWeeklyDpeEnergySlaves(): Promise<void> {
    this.logger.log('Starting weekly DPE energy sieves import cron job');

    try {
      const today = new Date();
      const twentyFourMonthsAgo = subMonths(today, 24);
      const afterDate = format(twentyFourMonthsAgo, 'yyyy-MM-dd');

      const jobData: ListingJobData = {
        source: 'moteurimmo',
        afterDate,
        energyClassClasses: ['E', 'F', 'G'], // Poor energy performance
        propertyTypes: ['ancien'], // Focus on existing/old properties
        fetchType: 'energyClass_energy_sieves',
      };

      const job = await this.queue.add('fetch-energyClass-energy-sieves', jobData, {
        removeOnComplete: 10,
        removeOnFail: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      this.logger.log(
        `Enqueued DPE energy sieves job ${job.id} for DPE classes E/F/G since ${afterDate}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue weekly DPE energy sieves job: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw - let cron continue on schedule
    }
  }

  /**
   * Monthly job for comprehensive listings update
   * Fetches all listings from the last 6 months to ensure data completeness
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'monthly-comprehensive-listings-import',
    timeZone: 'Europe/Paris',
  })
  async handleMonthlyComprehensiveImport(): Promise<void> {
    this.logger.log('Starting monthly comprehensive listings import cron job');

    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);
      const afterDate = format(sixMonthsAgo, 'yyyy-MM-dd');

      const jobPromises: Promise<unknown>[] = [];

      // Job 1: All ancien properties (comprehensive update)
      const ancienJobData: ListingJobData = {
        source: 'moteurimmo',
        afterDate,
        propertyTypes: ['ancien'],
        fetchType: 'custom',
      };

      const ancienJob = this.queue
        .add('fetch-comprehensive-ancien', ancienJobData, {
          removeOnComplete: 10,
          removeOnFail: 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        })
        .then((job) => {
          this.logger.log(
            `Enqueued comprehensive ancien job ${job.id} since ${afterDate}`,
          );
          return job.id;
        })
        .catch((error: Error) => {
          this.logger.error(
            `Failed to enqueue comprehensive ancien job: ${error.message}`,
          );
          return null;
        });

      jobPromises.push(ancienJob);

      // Job 2: All energy classes for quality check
      const allEnergyClassesJobData: ListingJobData = {
        source: 'moteurimmo',
        afterDate,
        energyClassClasses: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        propertyTypes: ['ancien'],
        fetchType: 'custom',
      };

      const allEnergyJob = this.queue
        .add('fetch-comprehensive-energy', allEnergyClassesJobData, {
          removeOnComplete: 10,
          removeOnFail: 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          delay: 60000, // Start after 1 minute to avoid overwhelming API
        })
        .then((job) => {
          this.logger.log(
            `Enqueued comprehensive energy classes job ${job.id} since ${afterDate}`,
          );
          return job.id;
        })
        .catch((error: Error) => {
          this.logger.error(
            `Failed to enqueue comprehensive energy classes job: ${error.message}`,
          );
          return null;
        });

      jobPromises.push(allEnergyJob);

      // Wait for all jobs to be enqueued
      const results = await Promise.all(jobPromises);
      const successfulJobs = results.filter((id) => id !== null);

      this.logger.log(
        `Enqueued ${successfulJobs.length}/${jobPromises.length} comprehensive listings jobs`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue monthly comprehensive listings jobs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw - let cron continue on schedule
    }
  }

  /**
   * Manual job trigger for custom date ranges
   * This method can be called programmatically for ad-hoc imports
   */
  async enqueueCustomListingJob(
    afterDate?: string,
    beforeDate?: string,
    options: {
      energyClassClasses?: string[];
      propertyTypes?: string[];
      departments?: string[];
      fetchType?: 'energyClass_energy_sieves' | 'recent_listings' | 'custom';
    } = {},
  ): Promise<string> {
    this.logger.log(
      `Enqueuing custom listing job with date range: ${afterDate} to ${beforeDate}`,
      { options },
    );

    const jobData: ListingJobData = {
      source: 'moteurimmo',
      afterDate,
      beforeDate,
      ...options,
    };

    try {
      const job = await this.queue.add('fetch-custom-listings', jobData, {
        removeOnComplete: 10,
        removeOnFail: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      this.logger.log(`Successfully enqueued custom listings job ${job.id}`, {
        jobData,
      });

      return job.id || 'unknown';
    } catch (error) {
      this.logger.error(
        `Failed to enqueue custom listings job: ${(error as Error).message}`,
        { jobData },
      );
      throw error;
    }
  }
}
