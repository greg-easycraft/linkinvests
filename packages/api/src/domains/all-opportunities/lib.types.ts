import type {
  IAllOpportunitiesFilters,
  PaginationFilters,
} from '@linkinvests/shared';
import type { AllOpportunity } from '@linkinvests/shared';

export abstract class AllOpportunitiesRepository {
  abstract findAll(
    filters?: IAllOpportunitiesFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<AllOpportunity[]>;
  abstract count(filters?: IAllOpportunitiesFilters): Promise<number>;
}
