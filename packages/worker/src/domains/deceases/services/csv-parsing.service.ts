import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { InseeCsvRow, CsvProcessingStats } from '../types/deceases.types';

@Injectable()
export class CsvParsingService {
  private readonly logger = new Logger(CsvParsingService.name);

  /**
   * Parse INSEE CSV file with age filtering using streaming
   * @param buffer - CSV file buffer
   * @param minAge - Minimum age filter (default: 50)
   * @returns Promise resolving to parsed and filtered rows with statistics
   */
  public async parseCsv(
    buffer: Buffer,
    minAge: number = 50
  ): Promise<{
    rows: InseeCsvRow[];
    stats: Omit<
      CsvProcessingStats,
      | 'geocodingAttempts'
      | 'geocodingSuccesses'
      | 'mairieInfoAttempts'
      | 'mairieInfoSuccesses'
      | 'opportunitiesInserted'
      | 'errors'
      | 'failedRows'
    >;
  }> {
    this.logger.log('Starting streaming CSV parsing', {
      bufferSize: buffer.length,
      minAge,
    });

    const validRows: InseeCsvRow[] = [];
    const stats = {
      totalRecords: 0,
      recordsProcessed: 0,
      recordsFiltered: 0,
    };

    let isFirstRow = true;
    let hasHeader = false;

    // Create a transform stream to process rows
    const processingStream = new Transform({
      objectMode: true,
      transform: (chunk: string[], encoding, callback) => {
        try {
          stats.totalRecords++;

          // Check if first row is header
          if (isFirstRow) {
            if (
              chunk.length > 0 &&
              chunk[0] &&
              chunk[0].toLowerCase().includes('nomprenom')
            ) {
              hasHeader = true;
              this.logger.log('Detected CSV header row');
              isFirstRow = false;
              callback(); // Skip header row
              return;
            }
            isFirstRow = false;
          }

          // Validate row has correct number of columns
          if (chunk.length !== 9) {
            this.logger.warn('Row has incorrect number of columns', {
              expected: 9,
              actual: chunk.length,
              row: chunk.slice(0, 3), // Log first 3 columns for debugging
            });
            callback();
            return;
          }

          const csvRow: InseeCsvRow = {
            nomprenom: chunk[0] || '',
            sexe: chunk[1] || '',
            datenaiss: chunk[2] || '',
            lieunaiss: chunk[3] || '',
            commnaiss: chunk[4] || '',
            paysnaiss: chunk[5] || '',
            datedeces: chunk[6] || '',
            lieudeces: chunk[7] || '',
            actedeces: chunk[8] || '',
          };

          // Validate required fields
          if (
            !csvRow.nomprenom ||
            !csvRow.datenaiss ||
            !csvRow.datedeces ||
            !csvRow.lieudeces
          ) {
            callback();
            return;
          }

          // Apply age filter
          const age = this.calculateAge(csvRow.datenaiss, csvRow.datedeces);
          if (age < minAge) {
            stats.recordsFiltered++;
            callback();
            return;
          }

          validRows.push(csvRow);
          stats.recordsProcessed++;
          callback();
        } catch (error) {
          this.logger.warn('Failed to process CSV row', {
            error: error instanceof Error ? error.message : String(error),
            row: chunk.slice(0, 3), // Log first 3 columns for debugging
          });
          callback();
        }
      },
    });

    try {
      // Create readable stream from buffer
      const inputStream = Readable.from(buffer);

      // Create CSV parser stream
      const parser = parse({
        delimiter: ';',
        quote: '"',
        skip_empty_lines: true,
        relax_quotes: true,
        ltrim: true,
        rtrim: true,
        relax_column_count: true, // Allow variable column counts
      });

      // Process the stream
      await pipeline(inputStream, parser, processingStream);

      // Adjust stats if header was detected
      if (hasHeader) {
        stats.totalRecords--; // Don't count header row
      }

      this.logger.log('Streaming CSV parsing completed', {
        totalRecords: stats.totalRecords,
        recordsProcessed: stats.recordsProcessed,
        recordsFiltered: stats.recordsFiltered,
        hasHeader,
      });

      return {
        rows: validRows,
        stats,
      };
    } catch (error) {
      this.logger.error('Failed to parse CSV content', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `CSV streaming parsing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculate age at time of death
   * @param dateNaissance - Birth date in YYYYMMDD format
   * @param dateDeces - Death date in YYYYMMDD format
   * @returns Age in years
   */
  private calculateAge(dateNaissance: string, dateDeces: string): number {
    if (dateNaissance.length !== 8 || dateDeces.length !== 8) {
      return 0;
    }

    try {
      const birthYear = parseInt(dateNaissance.substring(0, 4), 10);
      const birthMonth = parseInt(dateNaissance.substring(4, 6), 10);
      const birthDay = parseInt(dateNaissance.substring(6, 8), 10);

      const deathYear = parseInt(dateDeces.substring(0, 4), 10);
      const deathMonth = parseInt(dateDeces.substring(4, 6), 10);
      const deathDay = parseInt(dateDeces.substring(6, 8), 10);

      let age = deathYear - birthYear;

      // Adjust for birthday not yet reached in death year
      if (
        deathMonth < birthMonth ||
        (deathMonth === birthMonth && deathDay < birthDay)
      ) {
        age--;
      }

      return Math.max(0, age);
    } catch (error) {
      this.logger.warn('Failed to calculate age', {
        dateNaissance,
        dateDeces,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }

  /**
   * Convert INSEE CSV row to standardized death record format
   * @param csvRow - Raw CSV row
   * @returns Standardized death record
   */
  public convertToDeathRecord(csvRow: InseeCsvRow): {
    nomPrenom: string;
    sexe: string;
    dateNaissance: string;
    lieuNaissance: string;
    communeNaissance: string;
    paysNaissance: string;
    dateDeces: string;
    lieuDeces: string;
    acteDeces: string;
  } {
    return {
      nomPrenom: csvRow.nomprenom,
      sexe: csvRow.sexe,
      dateNaissance: csvRow.datenaiss,
      lieuNaissance: csvRow.lieunaiss,
      communeNaissance: csvRow.commnaiss,
      paysNaissance: csvRow.paysnaiss,
      dateDeces: csvRow.datedeces,
      lieuDeces: csvRow.lieudeces,
      acteDeces: csvRow.actedeces,
    };
  }

  /**
   * Generate failed records CSV content
   * @param failedRows - Array of failed rows with error messages
   * @returns CSV content as string
   */
  public generateFailedRecordsCsv(
    failedRows: Array<{ row: InseeCsvRow; error: string }>
  ): string {
    if (failedRows.length === 0) {
      return '';
    }

    const header =
      '"nomprenom";"sexe";"datenaiss";"lieunaiss";"commnaiss";"paysnaiss";"datedeces";"lieudeces";"actedeces";"error"\n';

    const rows = failedRows
      .map(({ row, error }) => {
        const escapedError = error.replace(/"/g, '""'); // Escape quotes
        return `"${row.nomprenom}";"${row.sexe}";"${row.datenaiss}";"${row.lieunaiss}";"${row.commnaiss}";"${row.paysnaiss}";"${row.datedeces}";"${row.lieudeces}";"${row.actedeces}";"${escapedError}"`;
      })
      .join('\n');

    return header + rows + '\n';
  }
}
