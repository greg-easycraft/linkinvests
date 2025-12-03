import type { IListingFilters, PaginationFilters } from '~/types/filters';
import type { Listing } from '@linkinvests/shared';

export abstract class ListingRepository {
  abstract findAll(
    filters?: IListingFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<Listing[]>;
  abstract findById(id: string): Promise<Listing | null>;
  abstract count(filters?: IListingFilters): Promise<number>;
  abstract getDistinctSources(): Promise<string[]>;
}
