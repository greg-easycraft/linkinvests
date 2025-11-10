// Base opportunity interface with common fields shared across all opportunity types
export interface BaseOpportunity {
  id: string; // UUID
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  opportunityDate: string;
  externalId?: string; // Made optional to match nullable database column
  createdAt: Date;
  updatedAt: Date;
}

// Base opportunity interface for creation (without generated fields)
export interface BaseOpportunityInput {
  label: string;
  address: string;
  zipCode: number;
  department: number;
  latitude: number;
  longitude: number;
  opportunityDate: string;
  externalId?: string;
}