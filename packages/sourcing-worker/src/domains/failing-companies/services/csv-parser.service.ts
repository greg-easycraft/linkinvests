import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import type {
  FailingCompanyCsvRow,
  ListePersonnesData,
} from '../types/failing-companies.types';

@Injectable()
export class CsvParserService {
  private readonly logger = new Logger(CsvParserService.name);

  /**
   * Parse CSV buffer
   * @param buffer - CSV file content as Buffer
   * @returns Array of CSV rows
   */
  parseCsv(buffer: Buffer): FailingCompanyCsvRow[] {
    this.logger.log('Starting CSV parsing');

    try {
      // Parse CSV
      const records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ';', // French CSV files typically use semicolon
        relax_column_count: true, // Allow varying column counts
      });

      this.logger.log(`Parsed ${records.length} rows from CSV`);

      return records as FailingCompanyCsvRow[];
    } catch (error) {
      this.logger.error(
        `Failed to parse CSV: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Extract unique SIRENs from CSV rows, keeping track of source rows
   * @param rows - Array of CSV rows
   * @returns Array of unique SIREN numbers with their source rows
   */
  extractSirensFromRows(
    rows: FailingCompanyCsvRow[],
  ): Array<{ siren: string; row: FailingCompanyCsvRow }> {
    const sirenMap = new Map<string, FailingCompanyCsvRow>();
    let successCount = 0;
    let errorCount = 0;

    for (const [index, record] of rows.entries()) {
      try {
        const siren = this.extractSirenFromRow(record);
        if (siren && !sirenMap.has(siren)) {
          sirenMap.set(siren, record);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        this.logger.warn(
          `Failed to extract SIREN from row ${index + 1}: ${(error as Error).message}`,
        );
      }
    }

    const sirens = Array.from(sirenMap.entries()).map(([siren, row]) => ({
      siren,
      row,
    }));

    this.logger.log(
      `Extracted ${sirens.length} unique SIREN(s) from ${rows.length} rows (${successCount} successful, ${errorCount} errors)`,
    );

    return sirens;
  }

  /**
   * Parse CSV buffer and extract unique SIREN numbers (legacy method)
   * @param buffer - CSV file content as Buffer
   * @returns Array of unique SIREN numbers
   */
  parseCsvAndExtractSirens(buffer: Buffer): string[] {
    const rows = this.parseCsv(buffer);
    const sirens = this.extractSirensFromRows(rows);
    return sirens.map((s) => s.siren);
  }

  /**
   * Extract SIREN from a CSV row
   * @param row - A single CSV row
   * @returns SIREN number or null if not found
   */
  private extractSirenFromRow(row: FailingCompanyCsvRow): string | null {
    if (!row.listepersonnes) {
      return null;
    }

    try {
      // Parse the JSON from listepersonnes field
      const personnesData = JSON.parse(
        row.listepersonnes,
      ) as ListePersonnesData[];
      console.log(personnesData);
      // listepersonnes can be an array or a single object
      const personnes = Array.isArray(personnesData)
        ? personnesData
        : [personnesData];

      // Find the first entry with a numeroImmatriculation.numeroIdentification
      for (const { personne } of personnes) {
        if (personne?.numeroImmatriculation?.numeroIdentification) {
          const numeroIdentification: string =
            personne.numeroImmatriculation.numeroIdentification;
          const siren = numeroIdentification.replace(/\s/g, ''); // Remove any spaces
          console.log(siren);
          // Validate SIREN format (9 digits)
          if (/^\d{9}$/.test(siren)) {
            return siren;
          } else {
            this.logger.warn(
              `Invalid SIREN format: ${siren} (expected 9 digits)`,
            );
          }
        }
      }

      return null;
    } catch (error) {
      // If JSON parsing fails, try to extract SIREN with regex as fallback
      const match = row.listepersonnes.match(/\b\d{9}\b/);
      if (match) {
        return match[0];
      }

      throw new Error(
        `Failed to parse listepersonnes JSON: ${(error as Error).message}`,
      );
    }
  }
}
