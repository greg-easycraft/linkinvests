export enum OpportunityType {
  LIQUIDATION = 'liquidation',
  ENERGY_SIEVE = 'energy_sieve',
  REAL_ESTATE_LISTING = 'real_estate_listing',
  AUCTION = 'auction',
  DIVORCE = 'divorce',
  SUCCESSION = 'succession',
}

export enum PropertyType {
  FLAT = 'flat',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  OTHER = 'other',
}

export enum AuctionSource {
  ENCHERES_PUBLIQUES = 'encheres-publiques',
}

export enum EnergyClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
}

export const UNKNOWN_ENERGY_CLASS = 'UNKNOWN' as const;

export type EnergyClassType = EnergyClass | typeof UNKNOWN_ENERGY_CLASS;

export enum AuctionOccupationStatus {
  OCCUPIED_BY_OWNER = 'occupied_by_owner',
  RENTED = 'rented',
  FREE = 'free',
  UNKNOWN = 'unknown',
}