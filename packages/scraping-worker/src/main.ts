import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const port = config.PORT ?? 8081;
  await app.listen(port);

  logger.log(`Scraping Worker is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => console.error(err));
