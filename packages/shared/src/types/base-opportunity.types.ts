// Base opportunity interface with common fields shared across all opportunity types
export interface BaseOpportunity {
  id: string; // UUID
  label: string;
  address?: string;
  zipCode: string;
  department: string;
  latitude: number;
  longitude: number;
  opportunityDate: string;
  externalId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base opportunity interface for creation (without generated fields)
export type BaseOpportunityInput = Omit<BaseOpportunity, 'id' | 'createdAt' | 'updatedAt'>;