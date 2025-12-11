import { Module } from '@nestjs/common';
import { EnergyDiagnosticsRepository } from './lib.types';
import { EnergyDiagnosticsRepositoryImpl } from './repositories/energy-diagnostics.repository';
import { EnergyDiagnosticsService } from './services/energy-diagnostics.service';
import { EnergyDiagnosticsController } from './energy-diagnostics.controller';

@Module({
  controllers: [EnergyDiagnosticsController],
  providers: [
    {
      provide: EnergyDiagnosticsRepository,
      useClass: EnergyDiagnosticsRepositoryImpl,
    },
    EnergyDiagnosticsService,
  ],
})
export class EnergyDiagnosticsModule {}
