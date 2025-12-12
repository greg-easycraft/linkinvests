import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SOURCE_LISTINGS_QUEUE } from '@linkinvests/shared';
import { ListingsProcessor } from './listings.processor';
import { MoteurImmoService } from './services/moteur-immo.service';
import { ListingsRepository } from './repositories/listings.repository';
import { ListingsCron } from './cron/listings.cron';
import { RefreshTriggerService } from '../materialized-views';
import { config } from '~/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOURCE_LISTINGS_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [
    ListingsProcessor,
    MoteurImmoService,
    ListingsRepository,
    ListingsCron,
    RefreshTriggerService,
  ],
  exports: [BullModule],
})
export class ListingsModule {}
