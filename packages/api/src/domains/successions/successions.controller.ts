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
  SuccessionService,
  SuccessionServiceErrorReason,
} from './services/succession.service';
import {
  successionFiltersSchema,
  successionExportRequestSchema,
  type SuccessionFilters,
  type SuccessionExportRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('successions')
export class SuccessionsController {
  constructor(private readonly successionService: SuccessionService) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(successionFiltersSchema))
    filters: SuccessionFilters,
  ) {
    const result = await this.successionService.getSuccessionsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(successionFiltersSchema))
    filters: SuccessionFilters,
  ) {
    const result = await this.successionService.getSuccessionsCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.successionService.getSuccessionById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case SuccessionServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Succession not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(successionExportRequestSchema))
    body: SuccessionExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.successionService.exportList(
      body.filters ?? {},
      body.format,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case SuccessionServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Export limit exceeded. Please refine your filters.',
          );
        case SuccessionServiceErrorReason.UNSUPPORTED_FORMAT:
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
      'Content-Disposition': `attachment; filename="successions.${extension}"`,
    });

    const buffer = Buffer.from(await result.data.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
