import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { DeceasesModule } from './domains/deceases';
import { EnergySievesModule } from './domains/energy-sieves';
import { FailingCompaniesModule } from './domains/failing-companies';
import { S3Module } from './storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(),
    S3Module,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    DeceasesModule,
    EnergySievesModule,
    FailingCompaniesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
