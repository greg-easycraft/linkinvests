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
import { AuctionService } from './services/auction.service';
import {
  auctionFiltersSchema,
  auctionExportRequestSchema,
  type AuctionFilters,
  type AuctionExportRequest,
} from '@linkinvests/shared';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(auctionFiltersSchema)) filters: AuctionFilters,
  ) {
    console.log(this.auctionService);
    return this.auctionService.getAuctionsData(filters);
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(auctionFiltersSchema)) filters: AuctionFilters,
  ) {
    const count = await this.auctionService.getAuctionsCount(filters);
    return { count };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const auction = await this.auctionService.getAuctionById(id);
    if (!auction) {
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    }
    return auction;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(auctionExportRequestSchema))
    body: AuctionExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blob = await this.auctionService.exportList(
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
      'Content-Disposition': `attachment; filename="auctions.${extension}"`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
