import { Module } from '@nestjs/common';
import { EnergyDiagnosticsRepository } from './lib.types.js';
import { DrizzleEnergyDiagnosticsRepository } from './repositories/energy-diagnostics.repository.js';
import { EnergyDiagnosticsService } from './services/energy-diagnostics.service.js';

@Module({
  providers: [
    {
      provide: EnergyDiagnosticsRepository,
      useClass: DrizzleEnergyDiagnosticsRepository,
    },
    EnergyDiagnosticsService,
  ],
  exports: [EnergyDiagnosticsService, EnergyDiagnosticsRepository],
})
export class EnergyDiagnosticsModule {}
