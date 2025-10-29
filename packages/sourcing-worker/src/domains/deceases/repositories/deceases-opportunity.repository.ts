import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpportunityType } from '@linkinvests/shared';
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
      } catch (error) {
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
