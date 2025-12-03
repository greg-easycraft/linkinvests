import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { domainSchema } from '@linkinvests/db';
import type { CompanyEstablishment } from '../types/failing-companies.types';

@Injectable()
export class FailingCompaniesOpportunityRepository {
  private readonly logger = new Logger(
    FailingCompaniesOpportunityRepository.name
  );

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  /**
   * Creates company contact JSONB object from establishment information
   */
  private createCompanyContact(establishment: CompanyEstablishment) {
    return {
      name: establishment.companyName,
      phone: undefined, // Not available in current data structure
      email: undefined, // Not available in current data structure
      legalRepresentative: undefined, // Not available in current data structure
      administrateur: undefined, // Not available in current data structure
    };
  }

  /**
   * Insert failing company opportunities into the database
   * @param establishments - Array of company establishments to insert
   * @returns Number of opportunities successfully inserted
   */
  async insertOpportunities(
    establishments: CompanyEstablishment[]
  ): Promise<number> {
    if (establishments.length === 0) {
      return 0;
    }

    const opportunities = establishments.map((est) => {
      const companyContact = this.createCompanyContact(est);

      return {
        // Base opportunity fields
        label: est.companyName,
        siret: est.siret, // Required for liquidations
        address: est.address,
        zipCode: est.zipCode,
        department: est.department.toString().padStart(2, '0'),
        latitude: est.latitude,
        longitude: est.longitude,
        opportunityDate: est.opportunityDate, // Already in string format 'YYYY-MM-DD'
        externalId: est.siret, // Use SIRET as external ID

        // Company contact info as JSONB
        companyContact,
      };
    });

    try {
      await this.db
        .insert(domainSchema.opportunityLiquidations)
        .values(opportunities)
        .onConflictDoNothing({
          target: [domainSchema.opportunityLiquidations.siret],
        });

      this.logger.log(`Inserted ${opportunities.length} opportunities`);
      return opportunities.length;
    } catch (error) {
      this.logger.error(
        `Failed to insert opportunities: ${(error as Error).message}`
      );
      throw error; // Rethrow to let the processor handle the error
    }
  }
}
