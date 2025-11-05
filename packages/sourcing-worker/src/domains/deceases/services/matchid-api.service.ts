import { Injectable, Logger } from '@nestjs/common';

import type { InseeDeathRecord } from '../types/deceases.types';

export interface MatchidDeathRecord {
  NOM: string;
  PRENOM: string;
  PRENOMS?: string;
  SEXE: string; // 'M' or 'F'
  DATE_NAISSANCE: string; // YYYYMMDD
  DATE_NAISSANCE_NORM: string; // YYYY-MM-DD
  CODE_INSEE_NAISSANCE: string;
  COMMUNE_NAISSANCE: string;
  DEPARTEMENT_NAISSANCE?: string;
  PAYS_NAISSANCE: string;
  PAYS_NAISSANCE_CODEISO3?: string;
  GEOPOINT_NAISSANCE?: string; // "lat,lng"
  DATE_DECES: string; // YYYYMMDD
  DATE_DECES_NORM: string; // YYYY-MM-DD
  AGE_DECES: string;
  CODE_INSEE_DECES: string;
  COMMUNE_DECES: string;
  DEPARTEMENT_DECES?: string;
  PAYS_DECES: string;
  PAYS_DECES_CODEISO3?: string;
  GEOPOINT_DECES?: string; // "lat,lng"
  NUM_DECES: string;
  UID: string;
  SOURCE: string;
}

export interface MatchidSearchResponse {
  response: {
    docs: MatchidDeathRecord[];
    numFound: number;
    start: number;
  };
}

export interface MatchidBulkResponse {
  job_id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  result_url?: string;
  error?: string;
}

@Injectable()
export class MatchidApiService {
  private readonly logger = new Logger(MatchidApiService.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;

  // Rate limiting - matchID allows 1 req/s for search, 50-100 req/s for bulk
  private lastRequestTime = 0;
  private readonly minRequestInterval: number;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  constructor() {
    this.baseUrl =
      process.env.MATCHID_API_URL || 'https://deces.matchid.io/deces/api/v1';
    this.apiToken = process.env.MATCHID_API_TOKEN || '';
    this.minRequestInterval = parseInt(
      process.env.MATCHID_RATE_LIMIT_MS || '1000',
      10,
    );

    if (!this.apiToken) {
      this.logger.warn(
        'MATCHID_API_TOKEN not configured. API calls may be limited.',
      );
    }
  }

  /**
   * Fetch death records for a date range
   * Uses the search API with date filtering
   */
  async fetchDeathRecords(
    sinceDate: string,
    untilDate?: string,
  ): Promise<InseeDeathRecord[]> {
    const endDate = untilDate || sinceDate;

    this.logger.log(
      {
        sinceDate,
        untilDate: endDate,
      },
      'Fetching death records from matchID API',
    );

    try {
      const allRecords: MatchidDeathRecord[] = [];
      let start = 0;
      const rows = 1000; // Process 1000 records at a time
      let totalFound = 0;

      do {
        const response = await this.searchDeathRecords(
          sinceDate,
          endDate,
          start,
          rows,
        );

        if (start === 0) {
          totalFound = response.response.numFound;
          this.logger.log(
            {
              totalFound,
              dateRange: `${sinceDate} to ${endDate}`,
            },
            'Found death records in date range',
          );
        }

        allRecords.push(...response.response.docs);
        start += rows;

        // Progress logging for large datasets
        if (totalFound > rows) {
          this.logger.log(
            {
              processed: Math.min(start, totalFound),
              total: totalFound,
              progress: Math.round(
                (Math.min(start, totalFound) / totalFound) * 100,
              ),
            },
            'Processing death records batch',
          );
        }
      } while (start < totalFound);

      // Convert to INSEE format and filter by age
      const inseeRecords = allRecords
        .map((record) => this.convertToInseeFormat(record))
        .filter((record) => {
          const age = this.calculateAge(record.dateNaissance, record.dateDeces);
          return age >= 50;
        });

      this.logger.log(
        {
          totalFetched: allRecords.length,
          afterAgeFilter: inseeRecords.length,
          ageThreshold: 50,
        },
        'Completed death records processing',
      );

      return inseeRecords;
    } catch (error: unknown) {
      this.logger.error(
        {
          error,
          sinceDate,
          untilDate: endDate,
        },
        'Failed to fetch death records',
      );
      throw error;
    }
  }

  /**
   * Search death records using the matchID search API
   */
  private async searchDeathRecords(
    sinceDate: string,
    untilDate: string,
    start: number = 0,
    rows: number = 1000,
  ): Promise<MatchidSearchResponse> {
    // Convert YYYY-MM-DD to YYYYMMDD for matchID API
    const sinceDateFormatted = sinceDate.replace(/-/g, '');
    const untilDateFormatted = untilDate.replace(/-/g, '');

    // Build query for date range
    let query = `DATE_DECES:[${sinceDateFormatted} TO ${untilDateFormatted}]`;

    // Add age filter to reduce API load (50+ years at time of death)
    const currentYear = new Date().getFullYear();
    const maxBirthYear = currentYear - 50;
    query += ` AND DATE_NAISSANCE:[* TO ${maxBirthYear}1231]`;

    const url = `${this.baseUrl}/search`;
    const params = new URLSearchParams({
      q: query,
      start: start.toString(),
      rows: rows.toString(),
      wt: 'json',
      fl: 'NOM,PRENOM,PRENOMS,SEXE,DATE_NAISSANCE,DATE_NAISSANCE_NORM,CODE_INSEE_NAISSANCE,COMMUNE_NAISSANCE,DEPARTEMENT_NAISSANCE,PAYS_NAISSANCE,DATE_DECES,DATE_DECES_NORM,AGE_DECES,CODE_INSEE_DECES,COMMUNE_DECES,DEPARTEMENT_DECES,PAYS_DECES,NUM_DECES,UID,SOURCE',
    });

    const fullUrl = `${url}?${params.toString()}`;

    try {
      const response =
        await this.fetchWithRetry<MatchidSearchResponse>(fullUrl);
      return response;
    } catch (error: unknown) {
      this.logger.error(
        {
          error,
          query,
          start,
          rows,
        },
        'Failed to search death records',
      );
      throw error;
    }
  }

  /**
   * Convert matchID format to INSEE format for compatibility
   */
  private convertToInseeFormat(record: MatchidDeathRecord): InseeDeathRecord {
    return {
      nomPrenom: `${record.NOM}*${record.PRENOMS || record.PRENOM || ''}`,
      sexe: record.SEXE === 'M' ? '1' : '2',
      dateNaissance: record.DATE_NAISSANCE,
      lieuNaissance: record.CODE_INSEE_NAISSANCE,
      communeNaissance: record.COMMUNE_NAISSANCE,
      paysNaissance: record.PAYS_NAISSANCE,
      dateDeces: record.DATE_DECES,
      lieuDeces: record.CODE_INSEE_DECES,
      acteDeces: record.NUM_DECES,
    };
  }

  /**
   * Calculate age at time of death
   */
  private calculateAge(birthDate: string, deathDate: string): number {
    const birth = new Date(
      parseInt(birthDate.substring(0, 4)),
      parseInt(birthDate.substring(4, 6)) - 1,
      parseInt(birthDate.substring(6, 8)),
    );
    const death = new Date(
      parseInt(deathDate.substring(0, 4)),
      parseInt(deathDate.substring(4, 6)) - 1,
      parseInt(deathDate.substring(6, 8)),
    );

    let age = death.getFullYear() - birth.getFullYear();
    const monthDiff = death.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && death.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * HTTP client with retry logic and rate limiting
   */
  private async fetchWithRetry<T>(url: string): Promise<T> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        const headers: Record<string, string> = {
          Accept: 'application/json',
          'User-Agent': 'linkinvest-sourcing-worker/1.0',
        };

        // Add authentication if token is available
        if (this.apiToken) {
          headers['Authorization'] = `Bearer ${this.apiToken}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(60000), // 60s timeout for potentially large responses
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;

          this.logger.warn(
            {
              attempt,
              waitTime,
              url: url.substring(0, 100) + '...', // Truncate URL for logging
            },
            'Rate limited by matchID API',
          );

          await this.sleep(waitTime);
          continue;
        }

        // Handle authentication errors
        if (response.status === 401) {
          throw new Error(
            'Invalid or expired matchID API token. Please check MATCHID_API_TOKEN configuration.',
          );
        }

        if (response.status === 403) {
          throw new Error(
            'Access forbidden. Please check matchID API token permissions.',
          );
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(
            `matchID API returned status ${response.status}: ${errorText}`,
          );
        }

        const data = (await response.json()) as T;
        return data;
      } catch (error) {
        lastError = error as Error;

        if (
          attempt < this.maxRetries &&
          this.isRetryableError(error as Error)
        ) {
          const waitTime = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          this.logger.warn(
            {
              attempt,
              maxRetries: this.maxRetries,
              error: (error as Error).message,
              waitTime,
            },
            'matchID API request failed, retrying...',
          );

          await this.sleep(waitTime);
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Failed to fetch data from matchID API');
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryableMessages = [
      'fetch failed',
      'network error',
      'timeout',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
    ];

    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase()),
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
