import type { ILiquidationFilters, PaginationFilters } from '~/types/filters.js';
import type { Liquidation } from '@linkinvests/shared';

export abstract class LiquidationRepository {
  abstract findAll(filters?: ILiquidationFilters, paginationFilters?: PaginationFilters): Promise<Liquidation[]>;
  abstract findById(id: string): Promise<Liquidation | null>;
  abstract count(filters?: ILiquidationFilters): Promise<number>;
}