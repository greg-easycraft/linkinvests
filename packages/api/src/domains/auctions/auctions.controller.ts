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
  AuctionService,
  AuctionServiceErrorReason,
} from './services/auction.service';
import {
  auctionFiltersSchema,
  auctionExportRequestSchema,
  type AuctionFilters,
  type AuctionExportRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(auctionFiltersSchema)) filters: AuctionFilters,
  ) {
    const result = await this.auctionService.getAuctionsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(auctionFiltersSchema)) filters: AuctionFilters,
  ) {
    const result = await this.auctionService.getAuctionsCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.auctionService.getAuctionById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case AuctionServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Auction not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(auctionExportRequestSchema))
    body: AuctionExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auctionService.exportList(
      body.filters ?? {},
      body.format,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case AuctionServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Export limit exceeded. Please refine your filters.',
          );
        case AuctionServiceErrorReason.UNSUPPORTED_FORMAT:
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
      'Content-Disposition': `attachment; filename="auctions.${extension}"`,
    });

    const buffer = Buffer.from(await result.data.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
