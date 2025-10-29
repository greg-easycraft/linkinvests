import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';

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
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
      middleware: basicAuth({
        challenge: true,
        users: { admin: 'passwordhere' },
      }),
    }),
    DeceasesModule,
    EnergySievesModule,
    FailingCompaniesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
