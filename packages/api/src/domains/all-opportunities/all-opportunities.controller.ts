import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllOpportunitiesService } from './services/all-opportunities.service';
import {
  allOpportunitiesFiltersSchema,
  type AllOpportunitiesFilters,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('all-opportunities')
export class AllOpportunitiesController {
  constructor(
    private readonly allOpportunitiesService: AllOpportunitiesService,
  ) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(allOpportunitiesFiltersSchema))
    filters: AllOpportunitiesFilters,
  ) {
    const result =
      await this.allOpportunitiesService.getAllOpportunitiesData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(allOpportunitiesFiltersSchema))
    filters: AllOpportunitiesFilters,
  ) {
    const result =
      await this.allOpportunitiesService.getAllOpportunitiesCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }
}
