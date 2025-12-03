import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpException,
  StreamableFile,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Response } from 'express';
import { ListingService } from './services/listing.service';
import {
  listingFiltersSchema,
  listingExportRequestSchema,
  type ListingFilters,
  type ListingExportRequest,
} from '@linkinvests/shared';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingService: ListingService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(listingFiltersSchema)) filters: ListingFilters,
  ) {
    return this.listingService.getListingsData(filters);
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(listingFiltersSchema)) filters: ListingFilters,
  ) {
    const count = await this.listingService.getListingsCount(filters);
    return { count };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const listing = await this.listingService.getListingById(id);
    if (!listing) {
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }
    return listing;
  }

  @Get('sources')
  async getSources() {
    const sources = await this.listingService.getAvailableSources();
    return { sources };
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(listingExportRequestSchema))
    body: ListingExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blob = await this.listingService.exportList(
      body.filters ?? {},
      body.format,
    );

    const contentType =
      body.format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const extension = body.format === 'csv' ? 'csv' : 'xlsx';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="listings.${extension}"`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
