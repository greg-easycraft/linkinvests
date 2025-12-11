import { EnergyClass, GazClass } from '../constants';
import { BaseOpportunity } from './base-opportunity.types';

export interface EnergyDiagnostic extends BaseOpportunity {
  energyClass: EnergyClass;
  gazClass: GazClass;
  squareFootage: number;
  address: string;
}

export type EnergyDiagnosticInput = Omit<
  EnergyDiagnostic,
  'id' | 'createdAt' | 'updatedAt'
>;
