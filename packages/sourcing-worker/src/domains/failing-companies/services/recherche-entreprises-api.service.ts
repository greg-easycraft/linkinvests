import { Injectable, Logger } from '@nestjs/common';
import { request } from 'undici';
import type {
  RechercheEntreprisesResponse,
  Etablissement,
} from '../types/recherche-entreprises.types';

@Injectable()
export class RechercheEntreprisesApiService {
  private readonly logger = new Logger(RechercheEntreprisesApiService.name);
  private readonly baseUrl = 'https://recherche-entreprises.api.gouv.fr/search';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 100ms between requests (10 req/sec)

  /**
   * Fetch all establishments for a given SIREN
   * @param siren - The 9-digit SIREN number
   * @returns Array of all establishments (siege + matching_etablissements)
   */
  async getEstablishmentsBySiren(siren: string): Promise<Etablissement[]> {
    this.logger.log(`Fetching establishments for SIREN: ${siren}`);

    // Validate SIREN format
    if (!/^\d{9}$/.test(siren)) {
      this.logger.warn(`Invalid SIREN format: ${siren}`);
      return [];
    }

    try {
      const response = await this.fetchWithRateLimit(siren);

      if (!response.results || response.results.length === 0) {
        this.logger.warn(`No results found for SIREN: ${siren}`);
        return [];
      }

      const result = response.results[0];
      if (!result) {
        this.logger.warn(`No result data for SIREN: ${siren}`);
        return [];
      }

      const establishments: Etablissement[] = [];

      // Add siege (headquarters)
      if (result.siege) {
        establishments.push(result.siege);
      }

      // Add all matching establishments
      if (result.matching_etablissements) {
        establishments.push(...result.matching_etablissements);
      }

      this.logger.log(
        `Found ${establishments.length} establishment(s) for SIREN: ${siren}`,
      );

      return establishments;
    } catch (error) {
      this.logger.error(
        `Failed to fetch establishments for SIREN ${siren}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return [];
    }
  }

  /**
   * Fetch data from API with rate limiting and retry logic
   */
  private async fetchWithRateLimit(
    siren: string,
  ): Promise<RechercheEntreprisesResponse> {
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

        const url = `${this.baseUrl}?q=${siren}`;
        const response = await request(url, {
          method: 'GET',
          headersTimeout: 30000,
        });

        if (response.statusCode === 404) {
          // Company not found - not an error, just return empty results
          return {
            results: [],
            total_results: 0,
            page: 1,
            per_page: 10,
            total_pages: 0,
          };
        }

        if (response.statusCode === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers['retry-after'];
          const waitTime = retryAfter
            ? parseInt(retryAfter as string, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            `Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${this.maxRetries}`,
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.statusCode !== 200) {
          throw new Error(`API returned status ${response.statusCode}`);
        }

        const body = await response.body.json();
        return body as RechercheEntreprisesResponse;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}. Retrying...`,
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch data from API');
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
