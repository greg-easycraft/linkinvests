import {
  Controller,
  Get,
  Inject,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { AUCTIONS_SCRAPING_QUEUE } from '@linkinvests/shared';
import type { Queue } from 'bullmq';
import { DATABASE_CONNECTION, type DomainDbType } from './database';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
    @InjectQueue(AUCTIONS_SCRAPING_QUEUE)
    private readonly scrapingQueue: Queue
  ) {}

  @Get()
  async getHealth() {
    const checks = {
      database: { status: 'healthy', error: null as string | null },
      redis: { status: 'healthy', error: null as string | null },
    };

    let overallStatus = 'ok';

    const databaseStatus = await this.checkDatabaseConnection();
    const redisStatus = await this.checkRedisConnection();

    if (!databaseStatus) {
      overallStatus = 'degraded';
      checks.database.status = 'unhealthy';
      checks.database.error = 'Database connection failed';
    }

    if (!redisStatus) {
      overallStatus = 'degraded';
      checks.redis.status = 'unhealthy';
      checks.redis.error = 'Redis connection failed';
    }

    const response = {
      status: overallStatus,
      service: 'scraping-worker',
      message:
        'Scraping worker is running. Job management has been moved to queues-monitor app.',
      timestamp: new Date().toISOString(),
      checks,
    };

    // Return 503 Service Unavailable if any critical service is down
    if (overallStatus === 'degraded') {
      this.logger.error('Scraping worker is degraded.', {
        database: checks.database.status,
        redis: checks.redis.status,
      });
      throw new HttpException(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    this.logger.log(`Scraping worker is healthy`);
    // Return 200 OK even if one service is degraded (partial functionality)
    return response;
  }

  private async checkDatabaseConnection() {
    try {
      await this.db.execute('SELECT 1');
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }

  private async checkRedisConnection() {
    try {
      await this.scrapingQueue.isPaused();
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }
}
