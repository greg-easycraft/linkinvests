import { Injectable } from '@nestjs/common';
import { SuccessionRepository } from '../lib.types';
import type { ISuccessionFilters } from '~/types/filters';
import type { Succession } from '@linkinvests/shared';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunitiesDataQueryResult } from '~/types/query-result';
import { ExportService } from '~/common/export/services/export.service';
import type { ExportFormat } from '~/common/export/export.types';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters';

@Injectable()
export class SuccessionService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly successionRepository: SuccessionRepository,
    private readonly exportService: ExportService,
  ) {}

  async getSuccessionsData(
    filters?: ISuccessionFilters,
  ): Promise<OpportunitiesDataQueryResult<Succession>> {
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = filters?.page ?? 1;
    const offset = (page - 1) * pageSize;

    const opportunities = await this.successionRepository.findAll(filters, {
      limit: pageSize,
      offset,
    });

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getSuccessionsCount(filters?: ISuccessionFilters): Promise<number> {
    return await this.successionRepository.count(filters);
  }

  async getSuccessionById(id: string): Promise<Succession | null> {
    return await this.successionRepository.findById(id);
  }

  async exportList(
    filters: ISuccessionFilters,
    format: ExportFormat,
  ): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.successionRepository.count(filters);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(
        `Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`,
      );
    }

    // Fetch all matching successions
    const successions = (await this.successionRepository.findAll(
      filters,
    )) as unknown as Record<string, unknown>[];

    // Get French headers for successions
    const customHeaders = getOpportunityHeaders(OpportunityType.SUCCESSION);

    // Export data based on format
    if (format === 'csv') {
      return this.exportService.exportToCSV(successions, customHeaders);
    }
    if (format === 'xlsx') {
      return this.exportService.exportToXLSX(successions, customHeaders);
    }
    throw new Error(`Unsupported export format: ${format}`);
  }
}
