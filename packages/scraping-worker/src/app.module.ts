import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { AuctionsModule } from './domains/auctions';
import { config, ConfigModule } from './config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(config.DATABASE_URL),
    BullModule.forRoot({
      connection: {
        url: config.REDIS_URL,
      },
    }),
    AuctionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
