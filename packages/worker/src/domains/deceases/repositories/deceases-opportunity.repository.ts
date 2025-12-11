import { Inject, Injectable, Logger } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';

import { DATABASE_CONNECTION, type DomainDbType } from '~/database';

import { SuccessionInput } from '@linkinvests/shared';
import type { DeceasesOpportunityRepository } from '../types';

@Injectable()
export class DeceasesOpportunityRepositoryImpl implements DeceasesOpportunityRepository {
  private readonly logger = new Logger(DeceasesOpportunityRepositoryImpl.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  async insertOpportunities(
    opportunities: SuccessionInput[],
    batchSize: number = 500
  ): Promise<number> {
    if (opportunities.length === 0) {
      return 0;
    }

    let insertedCount = 0;

    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);

      try {
        await this.db
          .insert(domainSchema.opportunitySuccessions)
          .values(batch)
          .onConflictDoNothing({
            target: [domainSchema.opportunitySuccessions.externalId],
          });

        insertedCount += batch.length;
        this.logger.log(
          `Batch ${Math.floor(i / batchSize) + 1}: Inserted ${insertedCount}/${opportunities.length} opportunities`
        );
      } catch (error: unknown) {
        this.logger.error(
          { error, batchStart: i, batchSize: batch.length },
          'Failed to insert batch'
        );
        throw error;
      }
    }

    this.logger.log(`Successfully inserted ${insertedCount} opportunities`);
    return insertedCount;
  }
}
