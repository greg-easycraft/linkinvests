import { Injectable } from '@nestjs/common';
import type { IExportService, ExportFormat } from '../export.types';

@Injectable()
export class ExportService implements IExportService {
  async exportToCSV(
    data: Record<string, unknown>[],
    customHeaders?: Record<string, string>,
  ): Promise<Blob> {
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' });
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
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  async exportToXLSX(
    data: Record<string, unknown>[],
    customHeaders?: Record<string, string>,
  ): Promise<Blob> {
    // For now, return CSV format as XLSX requires additional library
    // In a real implementation, you would use a library like xlsx or exceljs
    const csv = await this.exportToCSV(data, customHeaders);
    return new Blob([await csv.text()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  generateFilename(prefix: string, format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${format}`;
  }
}
