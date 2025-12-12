import type {
  ISuccessionFilters,
  PaginationFilters,
} from '@linkinvests/shared';
import type { Succession } from '@linkinvests/shared';

export abstract class SuccessionRepository {
  abstract findAll(
    filters?: ISuccessionFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<Succession[]>;
  abstract findById(id: string): Promise<Succession | null>;
  abstract count(filters?: ISuccessionFilters): Promise<number>;
}
