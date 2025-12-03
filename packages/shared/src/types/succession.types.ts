import { BaseOpportunity } from './base-opportunity.types';

export interface Succession extends BaseOpportunity {
  address: string;
  firstName: string;
  lastName: string;
  // Mairie contact info as JSONB
  mairieContact: {
    name?: string;
    address: {
      complement1: string;
      complement2: string;
      numero_voie: string;
      service_distribution: string;
      code_postal: string;
      nom_commune: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
  };
}

export type SuccessionInput = Omit<
  Succession,
  'id' | 'createdAt' | 'updatedAt'
>;
