import { BaseOpportunity } from './base-opportunity.types';

export interface Liquidation extends BaseOpportunity {
  siret: string; // Required for liquidations
  address: string;
  // Company contact info as JSONB
  companyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    legalRepresentative?: string;
    administrateur?: string;
  };
}

export type LiquidationInput = Omit<
  Liquidation,
  'id' | 'createdAt' | 'updatedAt'
>;

// Legacy interface for backward compatibility during migration
export interface CompanyContactData {
  type: 'company_headquarters';
  companyName: string;
  siret: string;
  address: string;
  phone?: string;
  email?: string;
  legalRepresentative?: string;
  administrateur?: string;
}
