import type { IEnergyDiagnosticFilters, PaginationFilters } from '~/types';
import type { EnergyDiagnostic } from '@linkinvests/shared';

export abstract class EnergyDiagnosticsRepository {
  abstract findAll(
    filters?: IEnergyDiagnosticFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<EnergyDiagnostic[]>;
  abstract findById(id: string): Promise<EnergyDiagnostic | null>;
  abstract findByExternalId(
    externalId: string,
  ): Promise<EnergyDiagnostic | null>;
  abstract count(filters?: IEnergyDiagnosticFilters): Promise<number>;
}
