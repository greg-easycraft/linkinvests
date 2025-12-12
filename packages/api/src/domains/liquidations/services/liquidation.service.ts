import { Injectable, Logger } from '@nestjs/common';
import { LiquidationRepository } from '../lib.types';
import type { DatePeriod, ILiquidationFilters } from '@linkinvests/shared';
import type { Liquidation } from '@linkinvests/shared';
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

export enum LiquidationServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class LiquidationService {
  private readonly logger = new Logger(LiquidationService.name);
  private readonly EXPORT_LIMIT = 500;
  private allowedDatePeriodsSet = new Set<DatePeriod>([
    'last_month',
    'last_3_months',
    '6_months',
    '9_months',
    '12_months',
  ]);

  constructor(
    private readonly liquidationRepository: LiquidationRepository,
    private readonly exportService: ExportService,
  ) {}

  async getLiquidationsData(
    filters?: ILiquidationFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<Liquidation>,
      LiquidationServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;
      const offset = (page - 1) * pageSize;
      const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});

      const opportunities = await this.liquidationRepository.findAll(
        filtersToUse,
        { limit: pageSize, offset },
      );

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get liquidations data', error);
      return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getLiquidationsCount(
    filters?: ILiquidationFilters,
  ): Promise<OperationResult<number, LiquidationServiceErrorReason>> {
    try {
      const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});
      const count = await this.liquidationRepository.count(filtersToUse);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get liquidations count', error);
      return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getLiquidationById(
    id: string,
  ): Promise<OperationResult<Liquidation, LiquidationServiceErrorReason>> {
    try {
      const liquidation = await this.liquidationRepository.findById(id);
      if (!liquidation) {
        return refuse(LiquidationServiceErrorReason.NOT_FOUND);
      }
      return succeed(liquidation);
    } catch (error) {
      this.logger.error('Failed to get liquidation by id', error);
      return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportList(
    filters: ILiquidationFilters,
    format: ExportFormat,
  ): Promise<OperationResult<Blob, LiquidationServiceErrorReason>> {
    try {
      const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});
      // Check if the total count exceeds the export limit
      const total = await this.liquidationRepository.count(filtersToUse);

      if (total > this.EXPORT_LIMIT) {
        return refuse(LiquidationServiceErrorReason.EXPORT_LIMIT_EXCEEDED);
      }

      // Validate format
      if (format !== 'csv' && format !== 'xlsx') {
        return refuse(LiquidationServiceErrorReason.UNSUPPORTED_FORMAT);
      }

      // Fetch all matching liquidations
      const liquidations = (await this.liquidationRepository.findAll(
        filtersToUse,
      )) as unknown as Array<Record<string, unknown>>;

      // Get French headers for liquidations
      const customHeaders = getOpportunityHeaders(OpportunityType.LIQUIDATION);

      // Export data based on format
      if (format === 'csv') {
        const result = await this.exportService.exportToCSV(
          liquidations,
          customHeaders,
        );
        if (!result.success) {
          return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
        }
        return succeed(result.data);
      }

      const result = await this.exportService.exportToXLSX(
        liquidations,
        customHeaders,
      );
      if (!result.success) {
        return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
      }
      return succeed(result.data);
    } catch (error) {
      this.logger.error('Failed to export liquidations list', error);
      return refuse(LiquidationServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  private ensureDatePeriodFilter(
    filters: ILiquidationFilters,
  ): ILiquidationFilters {
    const filtersToUse = { ...filters };
    if (
      filtersToUse.dateAfter &&
      this.allowedDatePeriodsSet.has(filtersToUse.dateAfter)
    )
      return filtersToUse;
    return {
      ...filtersToUse,
      dateAfter: '12_months',
    };
  }
}
