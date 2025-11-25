import { Injectable, Logger } from '@nestjs/common';

import type {
  ApiLannuaireResponse,
  MairieContactInfo,
  RawMairieAddress,
  RawMairieData,
} from '../types/deceases.types';

export interface MairieData {
  contactInfo: MairieContactInfo;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  zipCode: string;
}

@Injectable()
export class InseeApiService {
  private readonly logger = new Logger(InseeApiService.name);
  private readonly lannuaireApiBaseUrl =
    'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration';

  // Rate limiting
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 100ms between requests
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  async fetchMairieData(codeLieu: string): Promise<MairieData | null> {
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
      return this.formatResponse(mairie);
    } catch (error: unknown) {
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
      } catch (error: unknown) {
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

  private formatResponse(data: RawMairieData): MairieData {
    if (!data.adresse) {
      throw new Error('No address found');
    }
    const adresse = JSON.parse(data.adresse) as RawMairieAddress[];
    const phoneData = data.telephone
      ? (JSON.parse(data.telephone) as { value: string })
      : null;
    if (adresse.length === 1) {
      const address = adresse[0];
      return {
        zipCode: address.code_postal,
        contactInfo: {
          name: data.nom,
          phone: phoneData?.value,
          email: data.adresse_courriel,
          address: {
            complement1: address.complement1,
            complement2: address.complement2,
            numero_voie: address.numero_voie,
            service_distribution: address.service_distribution,
            code_postal: address.code_postal,
            nom_commune: address.nom_commune,
          },
        },
        address: `${address.numero_voie} ${address.code_postal} ${address.nom_commune}`,
        coordinates: {
          latitude: parseFloat(address.latitude),
          longitude: parseFloat(address.longitude),
        },
      };
    }

    const addressWithCoordinates = adresse.find(
      (address) => address.type_adresse === 'Adresse',
    );
    if (!addressWithCoordinates) {
      throw new Error('No address with coordinates found');
    }

    const { latitude, longitude } = addressWithCoordinates;
    const postalAddress = adresse.find(
      (address) => address.type_adresse === 'Adresse postale',
    );
    return {
      contactInfo: {
        name: data.nom,
        phone: data.telephone,
        email: data.adresse_courriel,
        address: {
          complement1:
            postalAddress?.complement1 ?? addressWithCoordinates.complement1,
          complement2:
            postalAddress?.complement2 ?? addressWithCoordinates.complement2,
          numero_voie:
            postalAddress?.numero_voie ?? addressWithCoordinates.numero_voie,
          service_distribution:
            postalAddress?.service_distribution ??
            addressWithCoordinates.service_distribution,
          code_postal:
            postalAddress?.code_postal ?? addressWithCoordinates.code_postal,
          nom_commune:
            postalAddress?.nom_commune ?? addressWithCoordinates.nom_commune,
        },
      },
      address: `${addressWithCoordinates.numero_voie} ${addressWithCoordinates.service_distribution} ${addressWithCoordinates.code_postal} ${addressWithCoordinates.nom_commune}`,
      zipCode: addressWithCoordinates.code_postal ?? postalAddress?.code_postal,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
