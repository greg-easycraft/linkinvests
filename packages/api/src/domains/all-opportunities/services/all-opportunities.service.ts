import { Injectable, Logger } from '@nestjs/common';
import { AllOpportunitiesRepository } from '../lib.types';
import type { IAllOpportunitiesFilters } from '~/types';
import type { AllOpportunity } from '@linkinvests/shared';
import type { OpportunitiesDataQueryResult } from '~/types/query-result';
import { DEFAULT_PAGE_SIZE } from '~/constants';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum AllOpportunitiesServiceErrorReason {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class AllOpportunitiesService {
  private readonly logger = new Logger(AllOpportunitiesService.name);

  constructor(
    private readonly allOpportunitiesRepository: AllOpportunitiesRepository,
  ) {}

  async getAllOpportunitiesData(
    filters?: IAllOpportunitiesFilters,
  ): Promise<
    OperationResult<
      OpportunitiesDataQueryResult<AllOpportunity>,
      AllOpportunitiesServiceErrorReason
    >
  > {
    try {
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const page = filters?.page ?? 1;

      const offset = (page - 1) * pageSize;

      const opportunities = await this.allOpportunitiesRepository.findAll(
        filters,
        {
          limit: pageSize,
          offset,
        },
      );

      return succeed({
        opportunities,
        page,
        pageSize,
      });
    } catch (error) {
      this.logger.error('Failed to get all opportunities data', error);
      return refuse(AllOpportunitiesServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async getAllOpportunitiesCount(
    filters?: IAllOpportunitiesFilters,
  ): Promise<OperationResult<number, AllOpportunitiesServiceErrorReason>> {
    try {
      const count = await this.allOpportunitiesRepository.count(filters);
      return succeed(count);
    } catch (error) {
      this.logger.error('Failed to get all opportunities count', error);
      return refuse(AllOpportunitiesServiceErrorReason.UNKNOWN_ERROR);
    }
  }
}
