import { BaseOpportunity, BaseOpportunityInput } from './base-opportunity.types.js';

export interface EnergySieveOpportunity extends BaseOpportunity {
  // Note: siret is not included as it's always null for energy sieves
  // Energy-specific fields (normalized from extraData)
  energyClass?: string; // A-G rating, typically F or G for energy sieves
  dpeNumber?: string; // DPE certificate number
}

export interface EnergySieveOpportunityInput extends BaseOpportunityInput {
  // Energy-specific fields
  energyClass?: string;
  dpeNumber?: string;
}

// Legacy interface for backward compatibility during migration
export interface EnergySieveExtraData {
  energyClass?: string;
}