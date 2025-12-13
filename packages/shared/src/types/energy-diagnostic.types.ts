import { EnergyClass, GazClass } from '../constants';
import { BaseOpportunity } from './base-opportunity.types';

export interface EnergyDiagnostic extends BaseOpportunity {
  energyClass: EnergyClass;
  gazClass: GazClass;
  squareFootage: number;
  streetAddress: string; // Required for energy diagnostics (override optional from base)
}

export type EnergyDiagnosticInput = Omit<
  EnergyDiagnostic,
  'id' | 'createdAt' | 'updatedAt'
>;
