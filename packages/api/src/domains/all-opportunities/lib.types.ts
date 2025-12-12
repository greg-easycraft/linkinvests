import type { IAllOpportunitiesFilters, PaginationFilters } from '~/types';
import type { AllOpportunity } from '@linkinvests/shared';

export abstract class AllOpportunitiesRepository {
  abstract findAll(
    filters?: IAllOpportunitiesFilters,
    paginationFilters?: PaginationFilters,
  ): Promise<AllOpportunity[]>;
  abstract count(filters?: IAllOpportunitiesFilters): Promise<number>;
}
