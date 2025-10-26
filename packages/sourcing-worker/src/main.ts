import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupBullBoard } from './bullmq/bull-board.setup';
import {
  SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  SOURCE_COMPANY_BUILDINGS_QUEUE,
} from './bullmq/bullmq.module';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Get queue instances for Bull Board
  const failingCompaniesQueue = app.get<Queue>(
    SOURCE_FAILING_COMPANIES_REQUESTED_QUEUE,
  );
  const companyBuildingsQueue = app.get<Queue>(SOURCE_COMPANY_BUILDINGS_QUEUE);

  // Setup Bull Board dashboard
  const bullBoardRouter = setupBullBoard(
    failingCompaniesQueue,
    companyBuildingsQueue,
  );
  app.use('/admin/queues', bullBoardRouter);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Bull Board dashboard: http://localhost:${port}/admin/queues`);
}

bootstrap().catch((err) => console.error(err));
