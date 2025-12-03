import { Module } from '@nestjs/common';
import { SuccessionRepository } from './lib.types';
import { DrizzleSuccessionRepository } from './repositories/succession.repository';
import { SuccessionService } from './services/succession.service';

@Module({
  providers: [
    {
      provide: SuccessionRepository,
      useClass: DrizzleSuccessionRepository,
    },
    SuccessionService,
  ],
  exports: [SuccessionService, SuccessionRepository],
})
export class SuccessionsModule {}
