import type { EnergyClass, EnergyDiagnostic } from "@linkinvests/shared";

export const MAX_NUMBER_OF_RESULTS = 50;

export type DiagnosticQueryInput = {
  zipCode: string;
  energyClass: EnergyClass;
  squareFootageMin: number;
  squareFootageMax: number;
}

export interface IAddressSearchRepository {
  findAllForAddressSearch(input: DiagnosticQueryInput): Promise<EnergyDiagnostic[]>;
  findById(id: string): Promise<EnergyDiagnostic | null>;
}