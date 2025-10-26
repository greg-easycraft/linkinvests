import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BullMQModule } from './bullmq/bullmq.module';
import { WorkerModule } from './workers/worker.module';

@Module({
  imports: [DatabaseModule, BullMQModule, WorkerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
