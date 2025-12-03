import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './common/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  await app.listen(config.PORT);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
