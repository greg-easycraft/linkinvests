import type { AddressSearchInput, EnergyDiagnostic } from "@linkinvests/shared";

export interface IEnergyDiagnosticsRepository {
  findAllForAddressSearch(input: AddressSearchInput): Promise<EnergyDiagnostic[]>;
  findById(id: string): Promise<EnergyDiagnostic | null>;
}