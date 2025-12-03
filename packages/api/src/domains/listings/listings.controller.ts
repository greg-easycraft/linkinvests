import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  StreamableFile,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Response } from 'express';
import {
  ListingService,
  ListingServiceErrorReason,
} from './services/listing.service';
import {
  listingFiltersSchema,
  listingExportRequestSchema,
  type ListingFilters,
  type ListingExportRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingService: ListingService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(listingFiltersSchema)) filters: ListingFilters,
  ) {
    const result = await this.listingService.getListingsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(listingFiltersSchema)) filters: ListingFilters,
  ) {
    const result = await this.listingService.getListingsCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }

  @Get('sources')
  async getSources() {
    const result = await this.listingService.getAvailableSources();
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { sources: result.data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.listingService.getListingById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case ListingServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Listing not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(listingExportRequestSchema))
    body: ListingExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.listingService.exportList(
      body.filters ?? {},
      body.format,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case ListingServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Export limit exceeded. Please refine your filters.',
          );
        case ListingServiceErrorReason.UNSUPPORTED_FORMAT:
          throw new BadRequestException('Unsupported export format');
        default:
          throw new InternalServerErrorException();
      }
    }

    const contentType =
      body.format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const extension = body.format === 'csv' ? 'csv' : 'xlsx';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="listings.${extension}"`,
    });

    const buffer = Buffer.from(await result.data.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
