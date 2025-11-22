import { Injectable, Logger } from '@nestjs/common';
import type {
  DpeRecord,
  DpeApiResponse,
} from '../types/energy-diagnostics.types';

@Injectable()
export class AdemeApiService {
  private readonly logger = new Logger(AdemeApiService.name);
  private readonly baseUrl =
    'https://data.ademe.fr/data-fair/api/v1/datasets/energyClass03existant';

  // Rate limiting configuration
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 100ms between requests (10 requests/second - ADEME limit: 600 req/60sec)
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds base delay

  /**
   * Fetch all DPE records for a given department and energy classes
   * @param department - French department code (e.g., 75 for Paris)
   * @param sinceDate - Filter records since this date (format: YYYY-MM-DD)
   * @param energyClasses - Array of energy classes (e.g., ["F", "G"])
   * @param beforeDate - Filter records before this date (format: YYYY-MM-DD, optional)
   * @returns Array of all DPE records
   */
  async fetchAllDpeRecords(
    department: string,
    sinceDate: string,
    energyClasses: string[] = ['F', 'G'],
    beforeDate?: string,
  ): Promise<DpeRecord[]> {
    const allRecords: DpeRecord[] = [];
    let page = 1;
    const pageSize = 1000;
    let hasMorePages = true;

    const dateRangeText = beforeDate
      ? `from ${sinceDate} to ${beforeDate}`
      : `since ${sinceDate}`;
    this.logger.log(
      `Starting to fetch DPE records for department ${department} ${dateRangeText} with energy classes ${energyClasses.join(', ')}`,
    );

    while (hasMorePages) {
      try {
        const records = await this.fetchDpePage(
          department,
          sinceDate,
          energyClasses,
          page,
          pageSize,
          beforeDate,
        );

        allRecords.push(...records);

        this.logger.log(
          `Fetched page ${page}: ${records.length} records (total: ${allRecords.length})`,
        );

        // If we got fewer records than pageSize, we've reached the last page
        if (records.length < pageSize) {
          hasMorePages = false;
        } else {
          page++;
        }
      } catch (error) {
        const err = error as Error;

        // If we get a 400 error after fetching some records, it's likely we hit the API's pagination limit
        // Continue with the records we already fetched instead of failing completely
        if (err.message.includes('status 400') && allRecords.length > 0) {
          this.logger.warn(
            `Reached API pagination limit at page ${page}. Continuing with ${allRecords.length} records already fetched.`,
          );
          hasMorePages = false;
        } else {
          this.logger.error(`Failed to fetch page ${page}: ${err.message}`);
          throw error;
        }
      }
    }

    this.logger.log(
      `Completed fetching ${allRecords.length} DPE records for department ${department}`,
    );

    return allRecords;
  }

  /**
   * Fetch a single page of DPE records with rate limiting and retry logic
   * @param department - French department code
   * @param sinceDate - Filter records since this date
   * @param energyClasses - Array of energy classes
   * @param page - Page number (1-indexed)
   * @param size - Number of records per page
   * @param beforeDate - Filter records before this date (optional)
   * @returns Array of DPE records for this page
   */
  private async fetchDpePage(
    department: string,
    sinceDate: string,
    energyClasses: string[],
    page: number,
    size: number,
    beforeDate?: string,
  ): Promise<DpeRecord[]> {
    const url = this.buildApiUrl(
      department,
      sinceDate,
      energyClasses,
      page,
      size,
      beforeDate,
    );

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(30000), // 30 seconds timeout
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            `Rate limited on page ${page}. Waiting ${waitTime}ms before retry ${attempt}/${this.maxRetries}`,
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          throw new Error(`ADEME API returned status ${response.status}`);
        }

        const data = (await response.json()) as DpeApiResponse;

        return data.results || [];
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Attempt ${attempt}/${this.maxRetries} failed for page ${page}: ${lastError.message}. Retrying...`,
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    this.logger.error(
      `Failed to fetch DPE records from ADEME API after ${this.maxRetries} attempts: ${lastError?.message}`,
      lastError?.stack,
    );
    throw lastError || new Error('Failed to fetch data from ADEME API');
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build the ADEME API URL with proper query parameters
   * @param department - French department code
   * @param sinceDate - Filter records since this date
   * @param energyClasses - Array of energy classes
   * @param page - Page number
   * @param size - Number of records per page
   * @param beforeDate - Filter records before this date (optional)
   * @returns Complete API URL
   */
  private buildApiUrl(
    department: string,
    sinceDate: string,
    energyClasses: string[],
    page: number,
    size: number,
    beforeDate?: string,
  ): string {
    const departmentStr = department.toString().padStart(2, '0');

    // Build the query string using Data Fair API syntax (qs parameter)
    // Energy classes filter: (F OR G)
    const energyClassesFilter = `(${energyClasses.join(' OR ')})`;

    // Build date filter - support both sinceDate and beforeDate
    let dateFilter = `date_etablissement_energyClass:>=${sinceDate}`;
    if (beforeDate) {
      dateFilter += ` AND date_etablissement_energyClass:<=${beforeDate}`;
    }

    // Query string: department AND energy class AND date filter
    // Using qs syntax: field:value, AND/OR operators, >= and <= for date comparison
    const queryString = `code_departement_ban:"${departmentStr}" AND etiquette_energyClass:${energyClassesFilter} AND ${dateFilter}`;

    // Fields to select - only request the fields we need
    const selectFields = [
      'numero_energyClass',
      'adresse_ban',
      'code_postal_ban',
      'nom_commune_ban',
      'code_departement_ban',
      'etiquette_energyClass',
      'etiquette_ges',
      '_geopoint',
      'date_etablissement_energyClass',
      'date_reception_energyClass',
      'type_batiment',
      'annee_construction',
      'surface_habitable_logement',
    ].join(',');

    const params = new URLSearchParams({
      size: size.toString(),
      page: page.toString(),
      select: selectFields,
      qs: queryString,
    });

    return `${this.baseUrl}/lines?${params.toString()}`;
  }
}
