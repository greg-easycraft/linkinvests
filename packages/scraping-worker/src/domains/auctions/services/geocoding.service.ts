import { Injectable, Logger } from '@nestjs/common';

import type { GeocodingResponse } from '../types/geocoding.types';
import { AuctionOpportunity, RawAuctionOpportunity } from '../types';
import { DEPARTMENT_NAMES_MAP } from '../constants/departments';

@Injectable()
export class AuctionsGeocodingService {
  private readonly logger = new Logger(AuctionsGeocodingService.name);
  private readonly baseUrl = 'https://data.geopf.fr/geocodage/search';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly minScore = 0.5; // Minimum confidence score
  private lastRequestTime = 0;
  private readonly minRequestInterval = 25; // 25ms between requests (40 req/sec - buffer for 50/sec limit)

  private async geocodeAddress(address: string): Promise<{
    formattedAddress: string;
    zipCode: number;
    latitude: number;
    longitude: number;
  } | null> {
    if (!address || address.trim().length === 0) {
      this.logger.warn('Empty address provided for geocoding');
      return null;
    }

    this.logger.debug({ address }, 'Geocoding address');

    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await this.sleep(delay);
    }

    let lastError: Error | null = null;

    try {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          this.lastRequestTime = Date.now();

          const url = `${this.baseUrl}?q=${encodeURIComponent(address)}`;
          const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(30000),
          });

          if (response.status === 429) {
            // Rate limited - API blocks IP for 5 seconds with decreasing retry-after header
            const retryAfter = response.headers.get('retry-after');
            const waitTime = retryAfter
              ? parseInt(retryAfter, 10) * 1000 // Convert seconds to milliseconds
              : 5000; // Default to 5 seconds if no retry-after header

            this.logger.warn(
              {
                attempt,
                maxRetries: this.maxRetries,
                waitTime: waitTime / 1000, // Log in seconds for readability
                retryAfterHeader: retryAfter,
              },
              `API rate limit exceeded (429). IP blocked for ${waitTime / 1000}s. Waiting before retry...`
            );

            await this.sleep(waitTime);
            continue;
          }

          if (response.status !== 200) {
            throw new Error(`API returned status ${response.status}`);
          }

          const body = (await response.json()) as GeocodingResponse;

          if (!body.features || body.features.length === 0) {
            this.logger.warn({ address }, 'No geocoding results found');
            return null;
          }

          const feature = body.features[0];
          if (!feature) {
            this.logger.warn(
              { address },
              'No feature data in geocoding response'
            );
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
          const formattedAddress = feature.properties.label || address;
          const zipCode = feature.properties.postcode
            ? parseInt(feature.properties.postcode, 10)
            : 0;

          this.logger.debug(
            { address, formattedAddress, zipCode, latitude, longitude, score },
            'Successfully geocoded address'
          );

          return { formattedAddress, zipCode, latitude, longitude };
        } catch (error: unknown) {
          lastError = error as Error;
          if (attempt < this.maxRetries) {
            this.logger.warn(
              {
                attempt,
                maxRetries: this.maxRetries,
                error: lastError.message,
              },
              `Attempt ${attempt}/${this.maxRetries} failed. Retrying...`
            );
            await this.sleep(this.retryDelay * attempt);
          }
        }
      }

      // If we reach here, all retry attempts failed
      const errorMessage =
        lastError?.message || 'Failed to fetch data from API';
      const errorStack = lastError?.stack;

      this.logger.error(
        { address, error: errorMessage, stack: errorStack },
        'All retry attempts failed for geocoding request'
      );
      return null;
    } catch (error: unknown) {
      // Catch any unexpected errors outside the retry loop
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        { address, error: errorMessage, stack: errorStack },
        'Unexpected error during geocoding process'
      );
      return null;
    }
  }

  async geocodeBatch(
    auctionOpportunities: RawAuctionOpportunity[]
  ): Promise<Array<AuctionOpportunity>> {
    const results: Array<AuctionOpportunity> = [];
    const failures: Array<RawAuctionOpportunity> = [];

    this.logger.log(
      { total: auctionOpportunities.length },
      `Geocoding batch of ${auctionOpportunities.length} auction opportunities`
    );

    for (let i = 0; i < auctionOpportunities.length; i++) {
      const auctionOpportunity = auctionOpportunities[i];

      const addressData = await this.geocodeAddress(
        this.formatAddressForRequest(auctionOpportunity)
      );
      if (!addressData) {
        this.logger.warn({ auctionOpportunity }, 'Failed to geocode address');
        failures.push(auctionOpportunity);
        continue;
      }

      const { formattedAddress, zipCode, latitude, longitude } = addressData;
      results.push({
        ...auctionOpportunity,
        address: formattedAddress,
        zipCode,
        latitude,
        longitude,
      });

      if ((i + 1) % 100 === 0) {
        this.logger.log(
          { processed: i + 1, total: auctionOpportunities.length },
          `Geocoded ${i + 1}/${auctionOpportunities.length} auction opportunities`
        );
      }
    }

    this.logger.log(
      {
        total: auctionOpportunities.length,
        geocoded: results.length,
        failed: failures.length,
      },
      `Batch geocoding complete: ${results.length}/${auctionOpportunities.length} geocoded`
    );

    if (failures.length > 0) {
      this.logger.warn(
        { failures: failures.map(this.formatAddressForRequest.bind(this)) },
        'Failed to geocode some addresses'
      );
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatAddressForRequest(opportunity: RawAuctionOpportunity): string {
    return `${opportunity.address} ${DEPARTMENT_NAMES_MAP[opportunity.department]?.split('-').join(' ') ?? ''}`.trim();
  }
}
