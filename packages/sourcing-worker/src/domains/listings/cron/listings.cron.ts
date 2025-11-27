import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  EnergyClass,
  PropertyType,
  SOURCE_LISTINGS_QUEUE,
} from '@linkinvests/shared';
import { format, subDays } from 'date-fns';
import { ListingJobData } from '../types';

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
      const oneDayAgo = subDays(today, 1);
      const afterDate = format(oneDayAgo, 'yyyy-MM-dd');

      const departments = Array.from({ length: 95 }, (_, i) => i + 1);

      for (const department of departments) {
        const jobData: ListingJobData = {
          afterDate,
          departmentCode: department.toString().padStart(2, '0'),
          energyGradeMax: EnergyClass.E,
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
        const landJobData: ListingJobData = {
          afterDate,
          departmentCode: department.toString().padStart(2, '0'),
          propertyTypes: [PropertyType.LAND],
        };
        const landJob = await this.queue.add(
          'fetch-recent-listings-land',
          landJobData,
          {
            removeOnComplete: 10,
            removeOnFail: 10,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );

        this.logger.log(
          `Enqueued recent listings jobs ${job.id} and ${landJob.id} for listings since ${afterDate} in department ${department}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to enqueue daily recent listings job: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw - let cron continue on schedule
    }
  }
}
