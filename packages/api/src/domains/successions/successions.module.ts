import { Module } from '@nestjs/common';
import { SuccessionRepository } from './lib.types.js';
import { DrizzleSuccessionRepository } from './repositories/succession.repository.js';
import { SuccessionService } from './services/succession.service.js';

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
