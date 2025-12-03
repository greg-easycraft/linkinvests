import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
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

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressSearchService: AddressSearchService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(addressSearchInputSchema))
    input: AddressSearchInput,
  ) {
    return this.addressSearchService.getPlausibleAddresses(input);
  }

  @Post('link')
  async link(
    @Body(new ZodValidationPipe(addressLinkRequestSchema))
    body: AddressLinkRequest,
  ) {
    return this.addressSearchService.searchAndLinkForOpportunity(
      body.input,
      body.opportunityId,
      body.opportunityType,
    );
  }

  @Get('links/:opportunityId')
  async getDiagnosticLinks(
    @Param('opportunityId') opportunityId: string,
    @Query(new ZodValidationPipe(getDiagnosticLinksQuerySchema))
    query: GetDiagnosticLinksQuery,
  ) {
    return this.addressSearchService.getDiagnosticLinks(
      opportunityId,
      query.opportunityType,
    );
  }
}
