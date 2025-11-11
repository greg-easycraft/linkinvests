import { BaseOpportunity, BaseOpportunityInput } from './base-opportunity.types.js';

export interface Liquidation extends BaseOpportunity {
  siret: string; // Required for liquidations
  // Company contact info as JSONB
  companyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    legalRepresentative?: string;
    administrateur?: string;
  };
}

export interface LiquidationInput extends BaseOpportunityInput {
  siret: string; // Required for liquidations
  // Company contact info as JSONB
  companyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    legalRepresentative?: string;
    administrateur?: string;
  };
}

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