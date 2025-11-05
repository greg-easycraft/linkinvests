import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpportunityType, type MairieContactData } from '@linkinvests/shared';
import { domainSchema } from '@linkinvests/db';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';

import type { DeceasesOpportunity, MairieInfo } from '../types/deceases.types';

@Injectable()
export class DeceasesOpportunityRepository {
  private readonly logger = new Logger(DeceasesOpportunityRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
  ) {}

  /**
   * Creates contact data from mairie information
   */
  private createContactData(
    mairieInfo?: MairieInfo,
    address?: string,
  ): MairieContactData | null {
    if (!mairieInfo) return null;

    return {
      type: 'mairie',
      name: mairieInfo.name || 'Mairie',
      address: address || '',
      phone: mairieInfo.telephone || mairieInfo.telephone_accueil,
      email: mairieInfo.email || mairieInfo.adresse_courriel,
      // Additional fields could be populated if available from API
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

      const records = batch.map((opportunity) => ({
        label: opportunity.label,
        siret: opportunity.siret,
        address: opportunity.address,
        zipCode: parseInt(opportunity.zipCode, 10),
        department: parseInt(opportunity.department, 10),
        latitude: opportunity.latitude,
        longitude: opportunity.longitude,
        type: OpportunityType.SUCCESSION,
        status: 'pending_review',
        opportunityDate: opportunity.opportunityDate,
        externalId: opportunity.inseeDeathId,
        contactData: this.createContactData(
          opportunity.mairieInfo,
          opportunity.address,
        ),
        extraData: null,
      }));

      try {
        await this.db
          .insert(domainSchema.opportunities)
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
