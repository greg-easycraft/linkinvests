import { Injectable, Logger } from '@nestjs/common';
import { SuccessionRepository } from '../lib.types';
import type { ISuccessionFilters } from '~/types';
import type { Succession } from '@linkinvests/shared';
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

export enum SuccessionServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class SuccessionService {
  private readonly logger = new Logger(SuccessionService.name);
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly successionRepository: SuccessionRepository,
    private readonly exportService: ExportService,
  ) {}

  async getSuccessionsData(
    filters?: ISuccessionFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<Succession>,
      SuccessionServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;
      const offset = (page - 1) * pageSize;

      const opportunities = await this.successionRepository.findAll(filters, {
        limit: pageSize,
        offset,
      });

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get successions data', error);
      return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getSuccessionsCount(
    filters?: ISuccessionFilters,
  ): Promise<OperationResult<number, SuccessionServiceErrorReason>> {
    try {
      const count = await this.successionRepository.count(filters);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get successions count', error);
      return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getSuccessionById(
    id: string,
  ): Promise<OperationResult<Succession, SuccessionServiceErrorReason>> {
    try {
      const succession = await this.successionRepository.findById(id);
      if (!succession) {
        return refuse(SuccessionServiceErrorReason.NOT_FOUND);
      }
      return succeed(succession);
    } catch (error) {
      this.logger.error('Failed to get succession by id', error);
      return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportList(
    filters: ISuccessionFilters,
    format: ExportFormat,
  ): Promise<OperationResult<Blob, SuccessionServiceErrorReason>> {
    try {
      // Check if the total count exceeds the export limit
      const total = await this.successionRepository.count(filters);

      if (total > this.EXPORT_LIMIT) {
        return refuse(SuccessionServiceErrorReason.EXPORT_LIMIT_EXCEEDED);
      }

      // Validate format
      if (format !== 'csv' && format !== 'xlsx') {
        return refuse(SuccessionServiceErrorReason.UNSUPPORTED_FORMAT);
      }

      // Fetch all matching successions
      const successions = (await this.successionRepository.findAll(
        filters,
      )) as unknown as Array<Record<string, unknown>>;

      // Get French headers for successions
      const customHeaders = getOpportunityHeaders(OpportunityType.SUCCESSION);

      // Export data based on format
      if (format === 'csv') {
        const result = await this.exportService.exportToCSV(
          successions,
          customHeaders,
        );
        if (!result.success) {
          return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
        }
        return succeed(result.data);
      }

      const result = await this.exportService.exportToXLSX(
        successions,
        customHeaders,
      );
      if (!result.success) {
        return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
      }
      return succeed(result.data);
    } catch (error) {
      this.logger.error('Failed to export successions list', error);
      return refuse(SuccessionServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
