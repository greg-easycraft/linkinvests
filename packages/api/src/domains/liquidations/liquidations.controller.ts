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
  LiquidationService,
  LiquidationServiceErrorReason,
} from './services/liquidation.service';
import {
  liquidationFiltersSchema,
  liquidationExportRequestSchema,
  type LiquidationFilters,
  type LiquidationExportRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('liquidations')
export class LiquidationsController {
  constructor(private readonly liquidationService: LiquidationService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(liquidationFiltersSchema))
    filters: LiquidationFilters,
  ) {
    const result = await this.liquidationService.getLiquidationsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(liquidationFiltersSchema))
    filters: LiquidationFilters,
  ) {
    const result = await this.liquidationService.getLiquidationsCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.liquidationService.getLiquidationById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case LiquidationServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Liquidation not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(liquidationExportRequestSchema))
    body: LiquidationExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.liquidationService.exportList(
      body.filters ?? {},
      body.format,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case LiquidationServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Export limit exceeded. Please refine your filters.',
          );
        case LiquidationServiceErrorReason.UNSUPPORTED_FORMAT:
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
      'Content-Disposition': `attachment; filename="liquidations.${extension}"`,
    });

    const buffer = Buffer.from(await result.data.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
