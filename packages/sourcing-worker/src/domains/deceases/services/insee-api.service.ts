import { Injectable, Logger } from '@nestjs/common';

import type {
  ApiGouvCommuneResponse,
  ApiLannuaireResponse,
} from '../types/deceases.types';

export interface CommuneCoordinates {
  longitude: number;
  latitude: number;
}

export interface MairieInfo {
  name: string;
  telephone: string;
  email: string;
}

@Injectable()
export class InseeApiService {
  private readonly logger = new Logger(InseeApiService.name);
  private readonly geoApiBaseUrl = 'https://geo.api.gouv.fr';
  private readonly lannuaireApiBaseUrl =
    'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration';

  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 100ms between requests
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  async fetchCommuneCoordinates(
    codeLieu: string,
  ): Promise<CommuneCoordinates | null> {
    const url = `${this.geoApiBaseUrl}/communes/${codeLieu}?fields=centre`;

    try {
      const response = await this.fetchWithRetry<ApiGouvCommuneResponse>(url);

      if (!response.centre) {
        this.logger.warn({ codeLieu }, 'No coordinates found for commune');
        return null;
      }

      const [longitude, latitude] = response.centre.coordinates;
      return { longitude, latitude };
    } catch (error) {
      this.logger.error(
        { error, codeLieu },
        'Failed to fetch commune coordinates',
      );
      return null;
    }
  }

  async fetchMairieInfo(codeLieu: string): Promise<MairieInfo | null> {
    const url = `${this.lannuaireApiBaseUrl}/records?where=code_insee_commune='${codeLieu}' AND pivot LIKE 'mairie%'&limit=1`;

    try {
      const response = await this.fetchWithRetry<ApiLannuaireResponse>(url);

      if (!response.results || response.results.length === 0) {
        this.logger.warn({ codeLieu }, 'No mairie found for commune');
        return null;
      }

      const mairie = response.results[0];
      if (!mairie) {
        return null;
      }
      return {
        name: mairie.nom || 'Mairie',
        telephone: mairie.telephone || mairie.telephone_accueil || '',
        email: mairie.email || mairie.adresse_courriel || '',
      };
    } catch (error) {
      this.logger.error({ error, codeLieu }, 'Failed to fetch mairie info');
      return null;
    }
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await this.sleep(this.minRequestInterval - timeSinceLastRequest);
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now();

        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            { attempt, waitTime },
            `Rate limited. Waiting ${waitTime}ms`,
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = (await response.json()) as T;
        return data;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            { attempt, maxRetries: this.maxRetries, error },
            `Attempt ${attempt}/${this.maxRetries} failed. Retrying...`,
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch data');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
