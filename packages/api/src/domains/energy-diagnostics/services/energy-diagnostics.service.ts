import { Injectable, Logger } from '@nestjs/common';
import { EnergyDiagnosticsRepository } from '../lib.types';
import type { IEnergyDiagnosticFilters } from '~/types';
import type { EnergyDiagnostic } from '@linkinvests/shared';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunitiesDataQueryResult } from '~/types/query-result';
import { ExportService } from '~/common/export/services/export.service';
import type { ExportFormat } from '~/common/export/export.types';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum EnergyDiagnosticsServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class EnergyDiagnosticsService {
  private readonly logger = new Logger(EnergyDiagnosticsService.name);
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly energyDiagnosticsRepository: EnergyDiagnosticsRepository,
    private readonly exportService: ExportService,
  ) {}

  async getEnergyDiagnosticsData(
    filters?: IEnergyDiagnosticFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<EnergyDiagnostic>,
      EnergyDiagnosticsServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;

      const offset = (page - 1) * pageSize;

      const opportunities = await this.energyDiagnosticsRepository.findAll(
        filters,
        { limit: pageSize, offset },
      );

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get energy diagnostics data', error);
      return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getEnergyDiagnosticsCount(
    filters?: IEnergyDiagnosticFilters,
  ): Promise<OperationResult<number, EnergyDiagnosticsServiceErrorReason>> {
    try {
      const count = await this.energyDiagnosticsRepository.count(filters);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get energy diagnostics count', error);
      return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getEnergyDiagnosticById(
    id: string,
  ): Promise<
    OperationResult<EnergyDiagnostic, EnergyDiagnosticsServiceErrorReason>
  > {
    try {
      const energyDiagnostic =
        await this.energyDiagnosticsRepository.findById(id);
      if (!energyDiagnostic) {
        return refuse(EnergyDiagnosticsServiceErrorReason.NOT_FOUND);
      }
      return succeed(energyDiagnostic);
    } catch (error) {
      this.logger.error('Failed to get energy diagnostic by id', error);
      return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getEnergyDiagnosticByExternalId(
    externalId: string,
  ): Promise<
    OperationResult<EnergyDiagnostic, EnergyDiagnosticsServiceErrorReason>
  > {
    try {
      const energyDiagnostic =
        await this.energyDiagnosticsRepository.findByExternalId(externalId);
      if (!energyDiagnostic) {
        return refuse(EnergyDiagnosticsServiceErrorReason.NOT_FOUND);
      }
      return succeed(energyDiagnostic);
    } catch (error) {
      this.logger.error(
        'Failed to get energy diagnostic by external id',
        error,
      );
      return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportList(
    filters: IEnergyDiagnosticFilters,
    format: ExportFormat,
  ): Promise<OperationResult<Blob, EnergyDiagnosticsServiceErrorReason>> {
    try {
      // Check if the total count exceeds the export limit
      const total = await this.energyDiagnosticsRepository.count(filters);

      if (total > this.EXPORT_LIMIT) {
        return refuse(
          EnergyDiagnosticsServiceErrorReason.EXPORT_LIMIT_EXCEEDED,
        );
      }

      // Validate format
      if (format !== 'csv' && format !== 'xlsx') {
        return refuse(EnergyDiagnosticsServiceErrorReason.UNSUPPORTED_FORMAT);
      }

      // Fetch all matching energy diagnostics
      const energyDiagnostics = (await this.energyDiagnosticsRepository.findAll(
        filters,
      )) as unknown as Array<Record<string, unknown>>;

      // Get French headers for energy diagnostics
      const customHeaders = getOpportunityHeaders(OpportunityType.ENERGY_SIEVE);

      // Export data based on format
      if (format === 'csv') {
        const result = await this.exportService.exportToCSV(
          energyDiagnostics,
          customHeaders,
        );
        if (!result.success) {
          return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
        }
        return succeed(result.data);
      }

      const result = await this.exportService.exportToXLSX(
        energyDiagnostics,
        customHeaders,
      );
      if (!result.success) {
        return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
      }
      return succeed(result.data);
    } catch (error) {
      this.logger.error('Failed to export energy diagnostics list', error);
      return refuse(EnergyDiagnosticsServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
