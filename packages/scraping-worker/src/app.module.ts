import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import basicAuth from 'express-basic-auth';

import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { AuctionsModule } from './domains/auctions';
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
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
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
    AuctionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
