import { Injectable, Logger } from '@nestjs/common';
import { ListingRepository } from '../lib.types';
import type { IListingFilters } from '@linkinvests/shared';
import type { Listing } from '@linkinvests/shared';
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

export enum ListingServiceErrorReason {
  NOT_FOUND = 'NOT_FOUND',
  EXPORT_LIMIT_EXCEEDED = 'EXPORT_LIMIT_EXCEEDED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class ListingService {
  private readonly logger = new Logger(ListingService.name);
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly exportService: ExportService,
  ) {}

  async getListingsData(
    filters?: IListingFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<Listing>,
      ListingServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;
      const offset = (page - 1) * pageSize;

      const opportunities = await this.listingRepository.findAll(filters, {
        limit: pageSize,
        offset,
      });

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get listings data', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getListingsCount(
    filters?: IListingFilters,
  ): Promise<OperationResult<number, ListingServiceErrorReason>> {
    try {
      const count = await this.listingRepository.count(filters);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get listings count', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getListingById(
    id: string,
  ): Promise<OperationResult<Listing, ListingServiceErrorReason>> {
    try {
      const listing = await this.listingRepository.findById(id);
      if (!listing) {
        return refuse(ListingServiceErrorReason.NOT_FOUND);
      }
      return succeed(listing);
    } catch (error) {
      this.logger.error('Failed to get listing by id', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getAvailableSources(): Promise<
    OperationResult<Array<string>, ListingServiceErrorReason>
  > {
    try {
      const sources = await this.listingRepository.getDistinctSources();
      return succeed(sources);
    } catch (error) {
      this.logger.error('Failed to get available sources', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportList(
    filters: IListingFilters,
    format: ExportFormat,
  ): Promise<OperationResult<Blob, ListingServiceErrorReason>> {
    try {
      // Check if the total count exceeds the export limit
      const total = await this.listingRepository.count(filters);

      if (total > this.EXPORT_LIMIT) {
        return refuse(ListingServiceErrorReason.EXPORT_LIMIT_EXCEEDED);
      }

      // Validate format
      if (format !== 'csv' && format !== 'xlsx') {
        return refuse(ListingServiceErrorReason.UNSUPPORTED_FORMAT);
      }

      // Fetch all matching listings
      const listings = (await this.listingRepository.findAll(
        filters,
      )) as unknown as Array<Record<string, unknown>>;

      // Get French headers for listings
      const customHeaders = getOpportunityHeaders(
        OpportunityType.REAL_ESTATE_LISTING,
      );

      // Export data based on format
      if (format === 'csv') {
        const result = await this.exportService.exportToCSV(
          listings,
          customHeaders,
        );
        if (!result.success) {
          return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
        }
        return succeed(result.data);
      }

      const result = await this.exportService.exportToXLSX(
        listings,
        customHeaders,
      );
      if (!result.success) {
        return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
      }
      return succeed(result.data);
    } catch (error) {
      this.logger.error('Failed to export listings list', error);
      return refuse(ListingServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
