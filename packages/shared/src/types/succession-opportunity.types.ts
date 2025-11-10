import { BaseOpportunity, BaseOpportunityInput } from './base-opportunity.types.js';

export interface SuccessionOpportunity extends BaseOpportunity {
  // Note: siret is not included as it's always null for successions
  // Succession-specific fields (normalized from extraData)
  firstName: string;
  lastName: string;
  // Mairie contact info as JSONB
  mairieContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
  };
}

export interface SuccessionOpportunityInput extends BaseOpportunityInput {
  // Succession-specific fields
  firstName: string;
  lastName: string;
  // Mairie contact info as JSONB
  mairieContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
  };
}

// Legacy interface for backward compatibility during migration
export interface MairieContactData {
  type: 'mairie';
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
}