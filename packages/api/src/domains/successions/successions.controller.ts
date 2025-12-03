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
import { SuccessionService } from './services/succession.service';
import {
  successionFiltersSchema,
  successionExportRequestSchema,
  type SuccessionFilters,
  type SuccessionExportRequest,
} from '@linkinvests/shared';

@Controller('successions')
export class SuccessionsController {
  constructor(private readonly successionService: SuccessionService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(successionFiltersSchema))
    filters: SuccessionFilters,
  ) {
    return this.successionService.getSuccessionsData(filters);
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(successionFiltersSchema))
    filters: SuccessionFilters,
  ) {
    const count = await this.successionService.getSuccessionsCount(filters);
    return { count };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const succession = await this.successionService.getSuccessionById(id);
    if (!succession) {
      throw new HttpException('Succession not found', HttpStatus.NOT_FOUND);
    }
    return succession;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(successionExportRequestSchema))
    body: SuccessionExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blob = await this.successionService.exportList(
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
      'Content-Disposition': `attachment; filename="successions.${extension}"`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
