import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { DatabaseModule } from './database';
import { AuctionsModule } from './domains/auctions';
import { DeceasesModule } from './domains/deceases';
import { EnergyDiagnosticsModule } from './domains/energy-diagnostics';
import { FailingCompaniesModule } from './domains/failing-companies';
import { ListingsModule } from './domains/listings';
import { config, ConfigModule } from './config';
import { SCRAPING_QUEUE } from '@linkinvests/shared';
import { ScrapingProcessor } from './scraping.processor';
import { S3Module } from './storage';

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
    BullModule.registerQueue({
      name: SCRAPING_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
    AuctionsModule,
    DeceasesModule,
    DeceasesModule,
    EnergyDiagnosticsModule,
    FailingCompaniesModule,
    ListingsModule,
  ],
  controllers: [AppController],
  providers: [ScrapingProcessor],
})
export class AppModule {}
