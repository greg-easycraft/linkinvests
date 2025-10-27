import { Injectable, Logger } from '@nestjs/common';
import { request } from 'undici';
import type { DpeRecord, DpeApiResponse } from '../types/energy-sieves.types';

@Injectable()
export class AdemeApiService {
  private readonly logger = new Logger(AdemeApiService.name);
  private readonly baseUrl =
    'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant';

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
   * @returns Array of all DPE records
   */
  async fetchAllDpeRecords(
    department: number,
    sinceDate: string,
    energyClasses: string[] = ['F', 'G'],
  ): Promise<DpeRecord[]> {
    const allRecords: DpeRecord[] = [];
    let page = 1;
    const pageSize = 1000;
    let hasMorePages = true;

    this.logger.log(
      `Starting to fetch DPE records for department ${department} since ${sinceDate} with energy classes ${energyClasses.join(', ')}`,
    );

    while (hasMorePages) {
      try {
        const records = await this.fetchDpePage(
          department,
          sinceDate,
          energyClasses,
          page,
          pageSize,
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
          this.logger.error(
            `Failed to fetch page ${page}: ${err.message}`,
          );
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
   * @returns Array of DPE records for this page
   */
  private async fetchDpePage(
    department: number,
    sinceDate: string,
    energyClasses: string[],
    page: number,
    size: number,
  ): Promise<DpeRecord[]> {
    const url = this.buildApiUrl(department, sinceDate, energyClasses, page, size);

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

        const response = await request(url, {
          method: 'GET',
          headersTimeout: 30000, // 30 seconds timeout
        });

        if (response.statusCode === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers['retry-after'];
          const waitTime = retryAfter
            ? parseInt(retryAfter as string, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            `Rate limited on page ${page}. Waiting ${waitTime}ms before retry ${attempt}/${this.maxRetries}`,
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.statusCode !== 200) {
          throw new Error(
            `ADEME API returned status ${response.statusCode}`,
          );
        }

        const data = (await response.body.json()) as DpeApiResponse;

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
   * @returns Complete API URL
   */
  private buildApiUrl(
    department: number,
    sinceDate: string,
    energyClasses: string[],
    page: number,
    size: number,
  ): string {
    const departmentStr = department.toString().padStart(2, '0');

    // Build the WHERE clause for energy classes
    // Example: (etiquette_dpe="F" OR etiquette_dpe="G")
    const energyClassesFilter = energyClasses
      .map((cls) => `etiquette_dpe="${cls}"`)
      .join(' OR ');

    // Add date filter using date_etablissement_dpe
    const whereClause = `code_departement_ban="${departmentStr}" AND (${energyClassesFilter}) AND date_etablissement_dpe>="${sinceDate}"`;

    // Fields to select
    const selectFields = [
      'numero_dpe',
      'adresse_ban',
      'code_postal_ban',
      'nom_commune_ban',
      'code_departement_ban',
      'etiquette_dpe',
      'etiquette_ges',
      '_geopoint',
      'date_etablissement_dpe',
      'date_reception_dpe',
      'type_batiment',
      'annee_construction',
      'surface_habitable_logement',
    ].join(',');

    const params = new URLSearchParams({
      size: size.toString(),
      page: page.toString(),
      select: selectFields,
      where: whereClause,
    });

    return `${this.baseUrl}/lines?${params.toString()}`;
  }
}
