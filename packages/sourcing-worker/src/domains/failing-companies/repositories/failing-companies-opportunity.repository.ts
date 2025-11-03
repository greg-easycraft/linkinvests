import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvests/db';
import { OpportunityType, type CompanyContactData } from '@linkinvests/shared';
import { sql } from 'drizzle-orm';
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
   * Creates contact data from company establishment information
   */
  private createContactData(
    establishment: CompanyEstablishment,
  ): CompanyContactData {
    return {
      type: 'company_headquarters',
      companyName: establishment.companyName,
      siret: establishment.siret,
      address: establishment.address,
      // Additional fields could be populated if available from API
    };
  }

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
      externalId: est.siret, // Use SIRET as external ID
      contactData: this.createContactData(est),
      extraData: null,
    }));

    try {
      await this.db
        .insert(domainSchema.opportunities)
        .values(opportunities)
        .onConflictDoUpdate({
          target: [
            domainSchema.opportunities.externalId,
            domainSchema.opportunities.type,
          ],
          set: {
            label: sql`EXCLUDED.label`,
            address: sql`EXCLUDED.address`,
            zipCode: sql`EXCLUDED.zip_code`,
            department: sql`EXCLUDED.department`,
            latitude: sql`EXCLUDED.latitude`,
            longitude: sql`EXCLUDED.longitude`,
            status: sql`EXCLUDED.status`,
            opportunityDate: sql`EXCLUDED.opportunity_date`,
            contactData: sql`EXCLUDED.contact_data`,
            extraData: sql`EXCLUDED.extra_data`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          },
        });

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
