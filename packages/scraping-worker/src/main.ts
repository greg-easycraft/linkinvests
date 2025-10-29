import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 8081;
  await app.listen(port);

  logger.log(`Scraping Worker is running on: http://localhost:${port}`);
  logger.log(`Bull Board dashboard: http://localhost:${port}/queues`);
}

bootstrap().catch((err) => console.error(err));
