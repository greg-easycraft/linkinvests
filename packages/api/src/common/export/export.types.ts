import type { OperationResult } from '~/common/utils/operation-result';
import type { ExportServiceErrorReason } from './services/export.service';

export type ExportFormat = 'csv' | 'xlsx';

export interface IExportService {
  exportToCSV(
    data: Array<Record<string, unknown>>,
    customHeaders?: Record<string, string>,
  ): Promise<OperationResult<Blob, ExportServiceErrorReason>>;
  exportToXLSX(
    data: Array<Record<string, unknown>>,
    customHeaders?: Record<string, string>,
  ): Promise<OperationResult<Blob, ExportServiceErrorReason>>;
  generateFilename(prefix: string, format: ExportFormat): string;
}
