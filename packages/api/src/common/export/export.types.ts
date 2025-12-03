export type ExportFormat = 'csv' | 'xlsx';

export interface IExportService {
  exportToCSV(data: Record<string, unknown>[], customHeaders?: Record<string, string>): Promise<Blob>;
  exportToXLSX(data: Record<string, unknown>[], customHeaders?: Record<string, string>): Promise<Blob>;
  generateFilename(prefix: string, format: ExportFormat): string;
}
