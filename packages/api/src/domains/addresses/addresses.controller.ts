import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AddressSearchService } from './services/address-search.service';
import {
  addressSearchInputSchema,
  addressLinkRequestSchema,
  getDiagnosticLinksQuerySchema,
  type AddressSearchInput,
  type AddressLinkRequest,
  type GetDiagnosticLinksQuery,
} from '@linkinvests/shared';
import { isRefusal, isSuccess } from '~/common/utils/operation-result';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressSearchService: AddressSearchService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(addressSearchInputSchema))
    input: AddressSearchInput,
  ) {
    const result = await this.addressSearchService.getPlausibleAddresses(input);
    if (isRefusal(result) || !isSuccess(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('link')
  async link(
    @Body(new ZodValidationPipe(addressLinkRequestSchema))
    body: AddressLinkRequest,
  ) {
    const result = await this.addressSearchService.searchAndLinkForOpportunity(
      body.input,
      body.opportunityId,
      body.opportunityType,
    );
    if (isRefusal(result) || !isSuccess(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Get('links/:opportunityId')
  async getDiagnosticLinks(
    @Param('opportunityId') opportunityId: string,
    @Query(new ZodValidationPipe(getDiagnosticLinksQuerySchema))
    query: GetDiagnosticLinksQuery,
  ) {
    const result = await this.addressSearchService.getDiagnosticLinks(
      opportunityId,
      query.opportunityType,
    );

    if (isRefusal(result) || !isSuccess(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }
}
