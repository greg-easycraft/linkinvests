import type { IAuctionFilters, PaginationFilters } from '@linkinvests/shared';
import type { Auction } from '@linkinvests/shared';

export abstract class AuctionRepository {
  abstract findAll(
    filters?: IAuctionFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<Auction[]>;
  abstract findById(id: string): Promise<Auction | null>;
  abstract count(filters?: IAuctionFilters): Promise<number>;
}
