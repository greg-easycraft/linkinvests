import { Injectable, Logger } from '@nestjs/common';
import type { IExportService, ExportFormat } from '../export.types';
import {
  type OperationResult,
  succeed,
  refuse,
} from '~/common/utils/operation-result';

export enum ExportServiceErrorReason {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Injectable()
export class ExportService implements IExportService {
  private readonly logger = new Logger(ExportService.name);

  async exportToCSV(
    data: Array<Record<string, unknown>>,
    customHeaders?: Record<string, string>,
  ): Promise<OperationResult<Blob, ExportServiceErrorReason>> {
    try {
      if (data.length === 0) {
        return succeed(new Blob([''], { type: 'text/csv' }));
      }

      const headers = Object.keys(data[0] ?? {});
      const headerRow = headers
        .map((h) => customHeaders?.[h] ?? h)
        .map((h) => `"${h}"`)
        .join(',');

      const rows = data.map((row) =>
        headers
          .map((h) => {
            const value = row[h];
            if (value === null || value === undefined) return '""';
            if (typeof value === 'object')
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(','),
      );

      const csv = [headerRow, ...rows].join('\n');
      return succeed(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    } catch (error) {
      this.logger.error('Failed to export to CSV', error);
      return refuse(ExportServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  async exportToXLSX(
    data: Array<Record<string, unknown>>,
    customHeaders?: Record<string, string>,
  ): Promise<OperationResult<Blob, ExportServiceErrorReason>> {
    try {
      // For now, return CSV format as XLSX requires additional library
      // In a real implementation, you would use a library like xlsx or exceljs
      const csvResult = await this.exportToCSV(data, customHeaders);
      if (!csvResult.success) {
        return refuse(csvResult.reason);
      }
      return succeed(
        new Blob([await csvResult.data.text()], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      );
    } catch (error) {
      this.logger.error('Failed to export to XLSX', error);
      return refuse(ExportServiceErrorReason.UNKNOWN_ERROR);
    }
  }

  generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${format}`;
  }
}
