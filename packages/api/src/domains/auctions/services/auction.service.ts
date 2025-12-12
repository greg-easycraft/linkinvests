import { Injectable, Logger } from '@nestjs/common';
import { AuctionRepository } from '../lib.types';
import type { IAuctionFilters } from '@linkinvests/shared';
import type { Auction } from '@linkinvests/shared';
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

export enum AuctionServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly exportService: ExportService,
  ) {}

  async getAuctionsData(
    filters?: IAuctionFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<Auction>,
      AuctionServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;

      const offset = (page - 1) * pageSize;

      const opportunities = await this.auctionRepository.findAll(filters, {
        limit: pageSize,
        offset,
      });

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get auctions data', error);
      return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getAuctionsCount(
    filters?: IAuctionFilters,
  ): Promise<OperationResult<number, AuctionServiceErrorReason>> {
    try {
      const count = await this.auctionRepository.count(filters);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get auctions count', error);
      return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getAuctionById(
    id: string,
  ): Promise<OperationResult<Auction, AuctionServiceErrorReason>> {
    try {
      const auction = await this.auctionRepository.findById(id);
      if (!auction) {
        return refuse(AuctionServiceErrorReason.NOT_FOUND);
      }
      return succeed(auction);
    } catch (error) {
      this.logger.error('Failed to get auction by id', error);
      return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportList(
    filters: IAuctionFilters,
    format: ExportFormat,
  ): Promise<OperationResult<Blob, AuctionServiceErrorReason>> {
    try {
      // Check if the total count exceeds the export limit
      const total = await this.auctionRepository.count(filters);

      if (total > this.EXPORT_LIMIT) {
        return refuse(AuctionServiceErrorReason.EXPORT_LIMIT_EXCEEDED);
      }

      // Validate format
      if (format !== 'csv' && format !== 'xlsx') {
        return refuse(AuctionServiceErrorReason.UNSUPPORTED_FORMAT);
      }

      // Fetch all matching auctions
      const auctions = (await this.auctionRepository.findAll(
        filters,
      )) as unknown as Array<Record<string, unknown>>;

      // Get French headers for auctions
      const customHeaders = getOpportunityHeaders(OpportunityType.AUCTION);

      // Export data based on format
      if (format === 'csv') {
        const result = await this.exportService.exportToCSV(
          auctions,
          customHeaders,
        );
        if (!result.success) {
          return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
        }
        return succeed(result.data);
      }

      const result = await this.exportService.exportToXLSX(
        auctions,
        customHeaders,
      );
      if (!result.success) {
        return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
      }
      return succeed(result.data);
    } catch (error) {
      this.logger.error('Failed to export auctions list', error);
      return refuse(AuctionServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
