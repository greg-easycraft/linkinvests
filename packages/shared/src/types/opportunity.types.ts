import { OpportunityType } from "../constants/opportunity.js";

// Re-export OpportunityType for backward compatibility
export { OpportunityType };

// Legacy polymorphic opportunity interface for backward compatibility
// This interface will be deprecated in favor of the new normalized types
interface LegacyBaseOpportunity {
  externalId?: string;
  type: OpportunityType;
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  opportunityDate: string;
  extraData?: unknown;
  images?: string[];
  contactData?: unknown;
}

// Legacy opportunity union type for backward compatibility
export interface LegacySuccessionOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.SUCCESSION;
}

export interface LegacyLiquidationOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.LIQUIDATION;
}

export interface LegacyAuctionOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.AUCTION;
}

export interface LegacyEnergySieveOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.ENERGY_SIEVE;
}

export interface LegacyRealEstateListingOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.REAL_ESTATE_LISTING;
}

export interface LegacyDivorceOpportunity extends LegacyBaseOpportunity {
  type: OpportunityType.DIVORCE;
}

// Legacy union type for backward compatibility during migration
export type Opportunity = LegacySuccessionOpportunity | LegacyLiquidationOpportunity | LegacyAuctionOpportunity | LegacyEnergySieveOpportunity | LegacyRealEstateListingOpportunity | LegacyDivorceOpportunity;