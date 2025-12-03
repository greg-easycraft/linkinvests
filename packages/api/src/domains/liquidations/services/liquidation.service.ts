import { Injectable } from '@nestjs/common';
import { LiquidationRepository } from '../lib.types.js';
import type { DatePeriod, ILiquidationFilters } from '~/types/filters.js';
import type { Liquidation } from '@linkinvests/shared';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunitiesDataQueryResult } from '~/types/query-result.js';
import { ExportService } from '~/common/export/services/export.service.js';
import type { ExportFormat } from '~/common/export/export.types.js';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service.js';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters.js';

@Injectable()
export class LiquidationService {
  private readonly EXPORT_LIMIT = 500;
  private allowedDatePeriodsSet = new Set<DatePeriod>(['last_month', 'last_3_months', '6_months', '9_months', '12_months']);

  constructor(
    private readonly liquidationRepository: LiquidationRepository,
    private readonly exportService: ExportService,
  ) {}

  async getLiquidationsData(filters?: ILiquidationFilters): Promise<OpportunitiesDataQueryResult<Liquidation>> {
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = filters?.page ?? 1;
    const offset = (page - 1) * pageSize;
    const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});

    const opportunities = await this.liquidationRepository.findAll(filtersToUse, { limit: pageSize, offset });

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  getLiquidationsCount(filters?: ILiquidationFilters): Promise<number> {
    const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});
    return this.liquidationRepository.count(filtersToUse);
  }

  getLiquidationById(id: string): Promise<Liquidation | null> {
    return this.liquidationRepository.findById(id);
  }

  async exportList(filters: ILiquidationFilters, format: ExportFormat): Promise<Blob> {
    const filtersToUse = this.ensureDatePeriodFilter(filters ?? {});
    // Check if the total count exceeds the export limit
    const total = await this.liquidationRepository.count(filtersToUse);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(`Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`);
    }

    // Fetch all matching liquidations
    const liquidations = (await this.liquidationRepository.findAll(filtersToUse)) as unknown as Record<string, unknown>[];

    // Get French headers for liquidations
    const customHeaders = getOpportunityHeaders(OpportunityType.LIQUIDATION);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(liquidations, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(liquidations, customHeaders);
    }
    throw new Error(`Unsupported export format: ${format}`);
  }

  private ensureDatePeriodFilter(filters: ILiquidationFilters): ILiquidationFilters {
    const filtersToUse = { ...filters };
    if (filtersToUse.datePeriod && this.allowedDatePeriodsSet.has(filtersToUse.datePeriod)) return filtersToUse;
    return {
      ...filtersToUse,
      datePeriod: '12_months'
    }

  }
}