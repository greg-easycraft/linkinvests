import { Injectable, Logger } from '@nestjs/common';

import type { Coordinates, GeocodingResponse } from '../types/geocoding.types';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly baseUrl = 'https://api-adresse.data.gouv.fr/search';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly minScore = 0.5; // Minimum confidence score
  private lastRequestTime = 0;
  private readonly minRequestInterval = 25; // 25ms between requests (40 req/sec - buffer for 50/sec limit)

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!address || address.trim().length === 0) {
      this.logger.warn('Empty address provided for geocoding');
      return null;
    }

    this.logger.debug({ address }, 'Geocoding address');

    try {
      const response = await this.fetchWithRateLimit(address);

      if (!response.features || response.features.length === 0) {
        this.logger.warn({ address }, 'No geocoding results found');
        return null;
      }

      const feature = response.features[0];
      if (!feature) {
        this.logger.warn({ address }, 'No feature data in geocoding response');
        return null;
      }

      const score = feature.properties.score;

      // Check if confidence score is acceptable
      if (score < this.minScore) {
        this.logger.warn(
          { address, score },
          `Low geocoding confidence (${score})`
        );
        return null;
      }

      const [longitude, latitude] = feature.geometry.coordinates;

      this.logger.debug(
        { address, latitude, longitude, score },
        'Successfully geocoded address'
      );

      return { latitude, longitude };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        { address, error: errorMessage, stack: errorStack },
        'Failed to geocode address'
      );
      return null;
    }
  }

  async geocodeBatch(addresses: string[]): Promise<Array<Coordinates | null>> {
    const results: Array<Coordinates | null> = [];

    this.logger.log(
      { total: addresses.length },
      `Geocoding batch of ${addresses.length} addresses`
    );

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      if (!address) {
        results.push(null);
        continue;
      }

      const coords = await this.geocodeAddress(address);
      results.push(coords);

      if ((i + 1) % 100 === 0) {
        this.logger.log(
          { processed: i + 1, total: addresses.length },
          `Geocoded ${i + 1}/${addresses.length} addresses`
        );
      }
    }

    const successful = results.filter((r) => r !== null).length;
    this.logger.log(
      { total: addresses.length, successful, failed: addresses.length - successful },
      `Batch geocoding complete: ${successful}/${addresses.length} successful`
    );

    return results;
  }

  private async fetchWithRateLimit(address: string): Promise<GeocodingResponse> {
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

        const url = `${this.baseUrl}/?q=${encodeURIComponent(address)}`;
        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(30000),
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = response.headers.get('retry-after');
          const waitTime = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : this.retryDelay * attempt;
          this.logger.warn(
            { attempt, maxRetries: this.maxRetries, waitTime },
            `Rate limited. Waiting ${waitTime}ms before retry`
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          throw new Error(`API returned status ${response.status}`);
        }

        const body = await response.json();
        return body as GeocodingResponse;
      } catch (error: unknown) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            { attempt, maxRetries: this.maxRetries, error: lastError.message },
            `Attempt ${attempt}/${this.maxRetries} failed. Retrying...`
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Failed to fetch data from API');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
