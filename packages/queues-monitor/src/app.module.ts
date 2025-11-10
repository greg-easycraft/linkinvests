import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import {
  SCRAPING_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
  INGEST_DECEASES_CSV_QUEUE,
  SOURCE_ENERGY_SIEVES_QUEUE,
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
} from '@linkinvests/shared';
import { ScrapingController } from './scraping/scraping.controller';
import { SourcingController } from './sourcing/sourcing.controller';
import { config } from './config';

const connection = {
  url: config.REDIS_URL,
};

@Module({
  imports: [
    // Setup BullMQ with Redis connection
    BullModule.forRoot({
      connection,
    }),

    // Setup BullBoard dashboard with authentication
    BullBoardModule.forRoot({
      route: '/',
      adapter: ExpressAdapter,
      middleware: basicAuth({
        users: {
          [config.BASIC_AUTH_USERNAME]: config.BASIC_AUTH_PASSWORD,
        },
        challenge: true,
      }),
    }),

    // Register all queues for monitoring (read-only, no processors)
    BullModule.registerQueue(
      {
        name: SCRAPING_QUEUE,
        connection,
      },
      {
        name: INGEST_DECEASES_CSV_QUEUE,
        connection,
      },
      {
        name: SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
        connection,
      },
      {
        name: SOURCE_COMPANY_BUILDINGS_QUEUE,
        connection,
      },
      {
        name: SOURCE_ENERGY_SIEVES_QUEUE,
        connection,
      },
    ),

    // Register all queues with BullBoard for dashboard visibility
    BullBoardModule.forFeature(
      {
        name: SCRAPING_QUEUE,
        adapter: BullMQAdapter,
      },
      {
        name: INGEST_DECEASES_CSV_QUEUE,
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
  controllers: [ScrapingController, SourcingController],
})
export class AppModule {}
