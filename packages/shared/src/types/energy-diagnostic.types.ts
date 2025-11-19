import { BaseOpportunity } from './base-opportunity.types.js';

export interface EnergyDiagnostic extends BaseOpportunity {
  // Note: siret is not included as it's always null for energy sieves
  // Energy-specific fields (normalized from extraData)
  energyClass: string; // A-G rating, typically F or G for energy sieves
  dpeNumber: string; // DPE certificate number
  squareFootage: number;
  address: string;
}

export type EnergyDiagnosticInput = Omit<EnergyDiagnostic, 'id' | 'createdAt' | 'updatedAt'>;
