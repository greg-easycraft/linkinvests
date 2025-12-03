import { Injectable } from '@nestjs/common';
import { ListingRepository } from '../lib.types';
import type { IListingFilters } from '~/types/filters';
import type { Listing } from '@linkinvests/shared';
import { OpportunityType } from '@linkinvests/shared';
import type { OpportunitiesDataQueryResult } from '~/types/query-result';
import { ExportService } from '~/common/export/services/export.service';
import type { ExportFormat } from '~/common/export/export.types';
import { getOpportunityHeaders } from '~/common/export/services/export-headers.service';
import { DEFAULT_PAGE_SIZE } from '~/constants/filters';

@Injectable()
export class ListingService {
  private readonly EXPORT_LIMIT = 500;

  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly exportService: ExportService,
  ) {}

  async getListingsData(filters?: IListingFilters): Promise<OpportunitiesDataQueryResult<Listing>> {
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const page = filters?.page ?? 1;
    const offset = (page - 1) * pageSize;

    const opportunities = await this.listingRepository.findAll(filters, { limit: pageSize, offset });

    return {
      opportunities,
      page,
      pageSize,
    };
  }

  async getListingsCount(filters?: IListingFilters): Promise<number> {
    return await this.listingRepository.count(filters);
  }

  async getListingById(id: string): Promise<Listing | null> {
    return await this.listingRepository.findById(id);
  }

  async getAvailableSources(): Promise<string[]> {
    return await this.listingRepository.getDistinctSources();
  }

  async exportList(filters: IListingFilters, format: ExportFormat): Promise<Blob> {
    // Check if the total count exceeds the export limit
    const total = await this.listingRepository.count(filters);

    if (total > this.EXPORT_LIMIT) {
      throw new Error(`Export limit exceeded. Found ${total} items, maximum allowed is ${this.EXPORT_LIMIT}. Please refine your filters.`);
    }

    // Fetch all matching listings
    const listings = (await this.listingRepository.findAll(filters)) as unknown as Record<string, unknown>[];

    // Get French headers for listings
    const customHeaders = getOpportunityHeaders(OpportunityType.REAL_ESTATE_LISTING);

    // Export data based on format
    if (format === "csv") {
      return this.exportService.exportToCSV(listings, customHeaders);
    }
    if (format === "xlsx") {
      return this.exportService.exportToXLSX(listings, customHeaders);
    }
      throw new Error(`Unsupported export format: ${format}`);
  }
}