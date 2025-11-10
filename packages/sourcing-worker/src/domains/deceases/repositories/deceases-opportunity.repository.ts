import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';

import type { DeceasesOpportunity } from '../types/deceases.types';

@Injectable()
export class DeceasesOpportunityRepository {
  private readonly logger = new Logger(DeceasesOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
  ) {}

  /**
   * Creates mairie contact JSONB object from mairie information
   */
  private createMairieContact(mairieInfo?: any) {
    if (!mairieInfo) {
      return undefined;
    }

    // Build full address string from address components
    const addressParts = [
      mairieInfo.address?.complement1,
      mairieInfo.address?.complement2,
      mairieInfo.address?.numero_voie,
      mairieInfo.address?.service_distribution,
      mairieInfo.address?.code_postal,
      mairieInfo.address?.nom_commune,
    ].filter(Boolean);

    return {
      name: mairieInfo.name || undefined,
      address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
      phone: mairieInfo.phone || undefined,
      email: mairieInfo.email || undefined,
      website: undefined, // Not available in current data structure
      openingHours: undefined, // Not available in current data structure
    };
  }

  async insertOpportunities(
    opportunities: DeceasesOpportunity[],
    batchSize: number = 500,
  ): Promise<number> {
    if (opportunities.length === 0) {
      return 0;
    }

    let insertedCount = 0;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      const records = batch.map((opportunity) => {
        const mairieContact = this.createMairieContact(opportunity.mairieInfo);

        return {
          // Base opportunity fields
          label: opportunity.label,
          // Note: siret removed as it's always null for successions
          address: opportunity.address,
          zipCode: opportunity.zipCode,
          department: opportunity.department,
          latitude: opportunity.latitude,
          longitude: opportunity.longitude,
          opportunityDate: opportunity.opportunityDate,
          externalId: opportunity.inseeDeathId,

          // Succession-specific fields (normalized from extraData)
          firstName: opportunity.extraData.firstName,
          lastName: opportunity.extraData.lastName,

          // Mairie contact info as JSONB
          mairieContact,
        };
      });

      try {
        await this.db
          .insert(domainSchema.opportunitySuccessions)
          .values(records)
          .onConflictDoNothing();

        insertedCount += batch.length;
        this.logger.log(
          `Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCount}/${opportunities.length} opportunities`,
        );
      } catch (error: unknown) {
        this.logger.error(
          { error, batchStart: i, batchSize: batch.length },
          'Failed to insert batch',
        );
        throw error;
      }
    }

    this.logger.log(`Successfully inserted ${insertedCount} opportunities`);
    return insertedCount;
  }
}
