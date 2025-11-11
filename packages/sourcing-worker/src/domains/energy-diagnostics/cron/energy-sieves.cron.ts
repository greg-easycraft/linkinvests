import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SOURCE_ENERGY_SIEVES_QUEUE } from '@linkinvests/shared';

import type { EnergyDiagnosticJobData } from '../types/energy-diagnostics.types';

@Injectable()
export class EnergyDiagnosticsCron {
  private readonly logger = new Logger(EnergyDiagnosticsCron.name);

  constructor(
    @InjectQueue(SOURCE_ENERGY_SIEVES_QUEUE)
    private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'daily-energy-sieves-import',
    timeZone: 'Europe/Paris',
  })
  async handleDailyImport(): Promise<void> {
    this.logger.log('Starting daily energy sieves import cron job');

    try {
      // Calculate date range (yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const sinceDate = yesterday.toISOString().split('T')[0];

      if (!sinceDate) {
        throw new Error("Failed to calculate yesterday's date");
      }

      // Enqueue jobs for all departments (1-95)
      const jobPromises: Promise<unknown>[] = [];
      const departments = Array.from({ length: 95 }, (_, i) => i + 1);
      for (const departmentId of departments) {
        for (const energyClass of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
          const jobData: EnergyDiagnosticJobData = {
            departmentId: departmentId.toString().padStart(2, '0'),
            sinceDate,
            energyClasses: [energyClass],
          };
          const promise = this.queue
            .add('source-energy-sieves', jobData, {
              removeOnComplete: 100,
              removeOnFail: 100,
            })
            .then(({ id: jobId }) => {
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
      }

      // Wait for all jobs to be enqueued
      await Promise.all(jobPromises);

      this.logger.log(`Enqueued ${jobPromises.length} energy sieves jobs`);
    } catch (error) {
      this.logger.error({
        error: (error as Error).message,
        message: 'Failed to enqueue daily deceases import',
      });
      // Don't throw - let cron continue on schedule
    }
  }
}
