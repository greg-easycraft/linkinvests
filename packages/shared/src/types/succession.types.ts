import { BaseOpportunity } from './base-opportunity.types.js';

export interface Succession extends BaseOpportunity {
  address: string;
  firstName: string;
  lastName: string;
  // Mairie contact info as JSONB
  mairieContact: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
  };
}

export type SuccessionInput = Omit<Succession, 'id' | 'createdAt' | 'updatedAt'>;