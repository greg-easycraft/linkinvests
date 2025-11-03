import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { DeceasesModule } from './domains/deceases';
import { EnergySievesModule } from './domains/energy-sieves';
import { FailingCompaniesModule } from './domains/failing-companies';
import { S3Module } from './storage';
import { config, ConfigModule } from './config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(config.DATABASE_URL),
    S3Module,
    BullModule.forRoot({
      connection: {
        url: config.REDIS_URL,
      },
    }),
    DeceasesModule,
    EnergySievesModule,
    FailingCompaniesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
