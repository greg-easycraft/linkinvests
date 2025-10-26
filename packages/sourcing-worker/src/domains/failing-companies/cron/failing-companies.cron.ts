import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '~/bullmq/queue.service';

@Injectable()
export class FailingCompaniesCron {
  private readonly logger = new Logger(FailingCompaniesCron.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Cron job that runs daily at 1:00 AM to fetch failing companies
   * for all departments (1-95) for the previous day
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'daily-failing-companies',
    timeZone: 'Europe/Paris',
  })
  async handleDailyFailingCompanies() {
    this.logger.log('Starting daily failing companies cron job');

    try {
      // Calculate yesterday's date in YYYY-MM-DD format
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const sinceDate = yesterday.toISOString().split('T')[0];

      if (!sinceDate) {
        throw new Error("Failed to calculate yesterday's date");
      }

      this.logger.log(
        `Enqueuing failing companies jobs for date: ${sinceDate}`,
      );

      // Enqueue jobs for all departments (1-95)
      const jobPromises: Promise<string | null>[] = [];
      const departments = Array.from({ length: 95 }, (_, i) => i + 1);
      for (const departmentId of departments) {
        const promise = this.queueService
          .sourceFailingCompanies({
            departmentId,
            sinceDate,
          })
          .then((jobId: string) => {
            this.logger.debug(
              `Enqueued job ${jobId} for department ${departmentId}`,
            );
            return jobId;
          })
          .catch((error: Error) => {
            this.logger.error(
              `Failed to enqueue job for department ${departmentId}: ${error.message}`,
            );
            return null;
          });

        jobPromises.push(promise);
      }

      // Wait for all jobs to be enqueued
      const jobIds = await Promise.all(jobPromises);

      this.logger.log(
        `Successfully enqueued ${jobIds.length} failing companies jobs for ${sinceDate}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to execute daily failing companies cron job: ${err.message}`,
        err.stack,
      );
      // Don't throw - let the cron continue to run on schedule
    }
  }
}
