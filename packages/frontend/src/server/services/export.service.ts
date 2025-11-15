import * as XLSX from "xlsx";
import { unparse } from "papaparse";

export type ExportFormat = "csv" | "xlsx";

export interface IExportService {
  exportToCSV<T extends Record<string, unknown>>(data: T[], customHeaders?: Record<string, string>): Promise<Blob>;
  exportToXLSX<T extends Record<string, unknown>>(data: T[], customHeaders?: Record<string, string>): Promise<Blob>;
  generateFilename(domain: string, format: ExportFormat, timestamp?: string): string;
}

export class ExportService implements IExportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV<T extends Record<string, unknown>>(data: T[], customHeaders?: Record<string, string>): Promise<Blob> {
    const firstRow = data[0];
    if (!firstRow) {
      throw new Error("No data to export");
    }
    const headers = this.getHeadersWithLabels(firstRow, customHeaders);
    const flattenedData = data.map((item) => this.flattenObject(headers.keys, item));

    const csv = unparse([headers.labels, ...flattenedData], {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
    });

    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
  }

  /**
   * Export data to XLSX format
   */
  async exportToXLSX<T extends Record<string, unknown>>(data: T[], customHeaders?: Record<string, string>): Promise<Blob> {
    const firstRow = data[0];
    if (!firstRow) {
      throw new Error("No data to export");
    }

    const headers = this.getHeadersWithLabels(firstRow, customHeaders);
    const flattenedData = data.map((item) => this.flattenObject(headers.keys, item));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([headers.labels, ...flattenedData]);

    const firstFlattenedRow = flattenedData[0];
    if (!firstFlattenedRow) {
      throw new Error("No data to export");
    }
    // Auto-size columns
    const columnWidths = this.calculateColumnWidths(headers.labels, firstFlattenedRow);
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
  }

  /**
   * Generate standardized filename for exports
   */
  generateFilename(domain: string, format: ExportFormat, timestamp?: string): string {
    const ts = timestamp || Date.now().toString();
    return `${domain}_export_${ts}.${format}`;
  }

  /**
   * Flatten nested objects for export
   */
  private flattenObject(headers: string[], obj: Record<string, unknown>): string[] {
    const flattened: string[] = [];

    for (const key of headers) {
      if (!obj.hasOwnProperty(key)) {
        flattened.push("");
        continue;
      }
      const value = obj[key];

      if (value === null || value === undefined) {
        flattened.push("");
        continue;
      }
      if (value instanceof Date) {
        flattened.push(this.formatDate(value));
        continue;
      }
      if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively flatten nested objects
        flattened.push(JSON.stringify(value));
        continue;
      }
      if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened.push(value.join(", "));
        continue;
      }
      flattened.push(value.toString());
    }

    return flattened;
  }

  /**
   * Format dates for human readability
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Calculate optimal column widths for Excel export
   */
  private calculateColumnWidths(headers: string[], firstRow: string[]): { wch: number }[] {
    const columnWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        firstRow[index] ? firstRow[index].toString().length : 0
      );

      // Cap the width at 50 characters for readability
      return { wch: Math.min(maxLength + 2, 50) };
    });

    return columnWidths;
  }

  private getHeadersWithLabels(
    row: Record<string, unknown>,
    customHeaders?: Record<string, string>
  ): { keys: string[]; labels: string[] } {
    const keys = Object.keys(row);
    const labels = keys.map(key => customHeaders?.[key] || key);
    return { keys, labels };
  }
}