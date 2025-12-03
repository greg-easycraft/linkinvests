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
  EnergyDiagnosticsService,
  EnergyDiagnosticsServiceErrorReason,
} from './services/energy-diagnostics.service';
import {
  energyDiagnosticFiltersSchema,
  energyDiagnosticExportRequestSchema,
  type EnergyDiagnosticFilters,
  type EnergyDiagnosticExportRequest,
} from '@linkinvests/shared';
import { isRefusal } from '~/common/utils/operation-result';

@Controller('energy-diagnostics')
export class EnergyDiagnosticsController {
  constructor(
    private readonly energyDiagnosticsService: EnergyDiagnosticsService,
  ) {}

  @Post('search')
  async search(
    @Body(new ZodValidationPipe(energyDiagnosticFiltersSchema))
    filters: EnergyDiagnosticFilters,
  ) {
    const result =
      await this.energyDiagnosticsService.getEnergyDiagnosticsData(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return result.data;
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(energyDiagnosticFiltersSchema))
    filters: EnergyDiagnosticFilters,
  ) {
    const result =
      await this.energyDiagnosticsService.getEnergyDiagnosticsCount(filters);
    if (isRefusal(result)) {
      throw new InternalServerErrorException();
    }
    return { count: result.data };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result =
      await this.energyDiagnosticsService.getEnergyDiagnosticById(id);
    if (isRefusal(result)) {
      switch (result.reason) {
        case EnergyDiagnosticsServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Energy diagnostic not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Get('external/:externalId')
  async getByExternalId(@Param('externalId') externalId: string) {
    const result =
      await this.energyDiagnosticsService.getEnergyDiagnosticByExternalId(
        externalId,
      );
    if (isRefusal(result)) {
      switch (result.reason) {
        case EnergyDiagnosticsServiceErrorReason.NOT_FOUND:
          throw new NotFoundException('Energy diagnostic not found');
        default:
          throw new InternalServerErrorException();
      }
    }
    return result.data;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(energyDiagnosticExportRequestSchema))
    body: EnergyDiagnosticExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.energyDiagnosticsService.exportList(
      body.filters ?? {},
      body.format,
    );

    if (isRefusal(result)) {
      switch (result.reason) {
        case EnergyDiagnosticsServiceErrorReason.EXPORT_LIMIT_EXCEEDED:
          throw new BadRequestException(
            'Export limit exceeded. Please refine your filters.',
          );
        case EnergyDiagnosticsServiceErrorReason.UNSUPPORTED_FORMAT:
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
      'Content-Disposition': `attachment; filename="energy-diagnostics.${extension}"`,
    });

    const buffer = Buffer.from(await result.data.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
