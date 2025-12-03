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
import { EnergyDiagnosticsService } from './services/energy-diagnostics.service';
import {
  energyDiagnosticFiltersSchema,
  energyDiagnosticExportRequestSchema,
  type EnergyDiagnosticFilters,
  type EnergyDiagnosticExportRequest,
} from '@linkinvests/shared';

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
    return this.energyDiagnosticsService.getEnergyDiagnosticsData(filters);
  }

  @Post('count')
  async count(
    @Body(new ZodValidationPipe(energyDiagnosticFiltersSchema))
    filters: EnergyDiagnosticFilters,
  ) {
    const count =
      await this.energyDiagnosticsService.getEnergyDiagnosticsCount(filters);
    return { count };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const diagnostic =
      await this.energyDiagnosticsService.getEnergyDiagnosticById(id);
    if (!diagnostic) {
      throw new HttpException(
        'Energy diagnostic not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return diagnostic;
  }

  @Get('external/:externalId')
  async getByExternalId(@Param('externalId') externalId: string) {
    const diagnostic =
      await this.energyDiagnosticsService.getEnergyDiagnosticByExternalId(
        externalId,
      );
    if (!diagnostic) {
      throw new HttpException(
        'Energy diagnostic not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return diagnostic;
  }

  @Post('export')
  async export(
    @Body(new ZodValidationPipe(energyDiagnosticExportRequestSchema))
    body: EnergyDiagnosticExportRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blob = await this.energyDiagnosticsService.exportList(
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
      'Content-Disposition': `attachment; filename="energy-diagnostics.${extension}"`,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
