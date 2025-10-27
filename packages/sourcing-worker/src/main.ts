import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => console.error(err));
