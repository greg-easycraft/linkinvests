import { Module } from '@nestjs/common';
import { EnergyDiagnosticsRepository } from './lib.types';
import { DrizzleEnergyDiagnosticsRepository } from './repositories/energy-diagnostics.repository';
import { EnergyDiagnosticsService } from './services/energy-diagnostics.service';
import { EnergyDiagnosticsController } from './energy-diagnostics.controller';

@Module({
  controllers: [EnergyDiagnosticsController],
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
