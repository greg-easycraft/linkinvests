import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import {
  SCRAPING_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  SOURCE_DECEASES_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
} from '@linkinvests/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapingController } from './scraping/scraping.controller';
import { SourcingController } from './sourcing/sourcing.controller';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

@Module({
  imports: [
    // Setup BullMQ with Redis connection
    BullModule.forRoot({
      connection: redisConnection,
    }),

    // Setup BullBoard dashboard with authentication
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
      middleware: basicAuth({
        users: {
          [process.env.BULL_BOARD_USERNAME || 'admin']:
            process.env.BULL_BOARD_PASSWORD || 'admin',
        },
        challenge: true,
      }),
    }),

    // Register all queues for monitoring (read-only, no processors)
    BullModule.registerQueue(
      {
        name: SCRAPING_QUEUE,
        connection: redisConnection,
      },
      {
        name: SOURCE_DECEASES_QUEUE,
        connection: redisConnection,
      },
      {
        name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
        connection: redisConnection,
      },
      {
        name: SOURCE_COMPANY_BUILDINGS_QUEUE,
        connection: redisConnection,
      },
      {
        name: SOURCE_ENERGY_SIEVES_QUEUE,
        connection: redisConnection,
      },
    ),

    // Register all queues with BullBoard for dashboard visibility
    BullBoardModule.forFeature(
      {
        name: SCRAPING_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: SOURCE_DECEASES_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: SOURCE_COMPANY_BUILDINGS_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: SOURCE_ENERGY_SIEVES_QUEUE,
        adapter: BullMQAdapter,
      },
    ),
  ],
  controllers: [AppController, ScrapingController, SourcingController],
  providers: [AppService],
})
export class AppModule {}
