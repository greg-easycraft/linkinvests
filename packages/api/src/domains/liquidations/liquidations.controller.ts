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
import { LiquidationService } from './services/liquidation.service';
import {
  liquidationFiltersSchema,
  liquidationExportRequestSchema,
  type LiquidationFilters,
  type LiquidationExportRequest,
} from '@linkinvests/shared';

@Controller('liquidations')
export class LiquidationsController {
  constructor(private readonly liquidationService: LiquidationService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(liquidationFiltersSchema))
    filters: LiquidationFilters,
  ) {
    return this.liquidationService.getLiquidationsData(filters);
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(liquidationFiltersSchema))
    filters: LiquidationFilters,
  ) {
    const count = await this.liquidationService.getLiquidationsCount(filters);
    return { count };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const liquidation = await this.liquidationService.getLiquidationById(id);
    if (!liquidation) {
      throw new HttpException('Liquidation not found', HttpStatus.NOT_FOUND);
    }
    return liquidation;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(liquidationExportRequestSchema))
    body: LiquidationExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blob = await this.liquidationService.exportList(
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
      'Content-Disposition': `attachment; filename="liquidations.${extension}"`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
