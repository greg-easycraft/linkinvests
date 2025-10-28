import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvest/db';
import { OpportunityType } from '@linkinvest/shared';
import type { CompanyEstablishment } from '../types/failing-companies.types';

@Injectable()
export class FailingCompaniesOpportunityRepository {
  private readonly logger = new Logger(
    FailingCompaniesOpportunityRepository.name,
  );

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType,
  ) {}

  /**
   * Insert failing company opportunities into the database
   * @param establishments - Array of company establishments to insert
   * @returns Number of opportunities successfully inserted
   */
  async insertOpportunities(
    establishments: CompanyEstablishment[],
  ): Promise<number> {
    if (establishments.length === 0) {
      return 0;
    }

    const opportunities = establishments.map((est) => ({
      label: est.companyName,
      siret: est.siret,
      address: est.address,
      zipCode: parseInt(est.zipCode, 10),
      department: est.department,
      latitude: est.latitude,
      longitude: est.longitude,
      type: OpportunityType.LIQUIDATION,
      status: 'pending_review',
      opportunityDate: est.opportunityDate, // Already in string format 'YYYY-MM-DD'
    }));

    try {
      await this.db
        .insert(domainSchema.opportunities)
        .values(opportunities)
        .onConflictDoNothing(); // Skip duplicates if SIRET already exists

      this.logger.log(`Inserted ${opportunities.length} opportunities`);
      return opportunities.length;
    } catch (error) {
      this.logger.error(
        `Failed to insert opportunities: ${(error as Error).message}`,
      );
      throw error; // Rethrow to let the processor handle the error
    }
  }
}
