import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { REFRESH_MATERIALIZED_VIEW_QUEUE } from '@linkinvests/shared';
import { MaterializedViewsProcessor } from './materialized-views.processor';
import { MaterializedViewsRepository } from './materialized-views.repository';
import { config } from '~/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: REFRESH_MATERIALIZED_VIEW_QUEUE,
      connection: {
        url: config.REDIS_URL,
      },
    }),
  ],
  providers: [MaterializedViewsProcessor, MaterializedViewsRepository],
  exports: [BullModule],
})
export class MaterializedViewsModule {}
