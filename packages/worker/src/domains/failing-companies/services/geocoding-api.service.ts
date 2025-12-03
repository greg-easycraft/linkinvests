import { Injectable, Logger } from '@nestjs/common';
import type { GeocodingResponse, Coordinates } from '../types/geocoding.types';

@Injectable()
export class GeocodingApiService {
  private readonly logger = new Logger(GeocodingApiService.name);
  private readonly baseUrl = 'https://api-adresse.data.gouv.fr/search';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly minScore = 0.5; // Minimum confidence score to accept geocoding result
  private lastRequestTime = 0;
  private readonly minRequestInterval = 25; // 25ms between requests (40 req/sec - buffer for 50/sec limit)

  /**
   * Geocode an address to get latitude and longitude
   * @param address - The address to geocode
   * @returns Coordinates or null if geocoding fails
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!address || address.trim().length === 0) {
      this.logger.warn('Empty address provided for geocoding');
      return null;
    }

    this.logger.debug(`Geocoding address: ${address}`);

    try {
      const response = await this.fetchWithRateLimit(address);

      if (!response.features || response.features.length === 0) {
        this.logger.warn(`No geocoding results found for address: ${address}`);
        return null;
      }

      const feature = response.features[0];
      if (!feature) {
        this.logger.warn(
          `No feature data in geocoding response for address: ${address}`
        );
        return null;
      }

      const score = feature.properties.score;

      // Check if confidence score is acceptable
      if (score < this.minScore) {
        this.logger.warn(
          `Low geocoding confidence (${score}) for address: ${address}`
        );
        return null;
      }

      const [longitude, latitude] = feature.geometry.coordinates;

      this.logger.debug(
        `Successfully geocoded address (score: ${score}): ${address} -> ${latitude}, ${longitude}`
      );

      return { latitude, longitude };
    } catch (error) {
      this.logger.error(
        `Failed to geocode address "${address}": ${(error as Error).message}`,
        (error as Error).stack
      );
      return null;
    }
  }

  /**
   * Fetch data from API with rate limiting and retry logic
   */
  private async fetchWithRateLimit(
    address: string
  ): Promise<GeocodingResponse> {
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
            `Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${this.maxRetries}`
          );
          await this.sleep(waitTime);
          continue;
        }

        if (response.status !== 200) {
          throw new Error(`API returned status ${response.status}`);
        }

        const body = (await response.json()) as GeocodingResponse;
        return body;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          this.logger.warn(
            `Attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}. Retrying...`
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
