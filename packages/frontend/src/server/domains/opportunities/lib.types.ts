import { domainSchema } from "@linkinvests/db";
import type { OpportunityType } from "@linkinvests/shared";
import type { OpportunityFilters } from "~/types/filters";

// Type-specific opportunity types from normalized tables
export type AuctionOpportunity = typeof domainSchema.opportunityAuctions.$inferSelect;
export type SuccessionOpportunity = typeof domainSchema.opportunitySuccessions.$inferSelect;
export type LiquidationOpportunity = typeof domainSchema.opportunityLiquidations.$inferSelect;
export type EnergySieveOpportunity = typeof domainSchema.opportunityEnergySieves.$inferSelect;

// Union type representing any opportunity - with type discrimination
export type Opportunity =
  | (AuctionOpportunity & { type: 'auction' })
  | (SuccessionOpportunity & { type: 'succession' })
  | (LiquidationOpportunity & { type: 'liquidation' })
  | (EnergySieveOpportunity & { type: 'energy_sieve' });

export interface IOpportunityRepository {
  findAll(filters?: OpportunityFilters): Promise<Opportunity[]>;
  findById(id: string): Promise<Opportunity | null>; // Changed to string for UUID
  count(filters?: OpportunityFilters): Promise<number>;
  // Type-specific methods for querying individual tables
  findAllByType(type: OpportunityType, filters?: OpportunityFilters): Promise<Opportunity[]>;
  findByIdAndType(id: string, type: OpportunityType): Promise<Opportunity | null>;
  countByType(type: OpportunityType, filters?: OpportunityFilters): Promise<number>;
}
