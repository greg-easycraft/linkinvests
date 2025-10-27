import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { S3Module } from './storage';
import { BullModule } from '@nestjs/bullmq';
import { FailingCompaniesModule } from './domains/failing-companies';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';

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
    FailingCompaniesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
