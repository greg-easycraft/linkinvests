// Opportunity type enums and constants

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

// Auction type
export interface Auction extends BaseOpportunity {
  url: string;
  propertyType?: PropertyType;
  description?: string;
  squareFootage?: number;
  rooms?: number;
  energyClass: EnergyClassType;
  auctionVenue?: string;
  currentPrice?: number;
  reservePrice?: number;
  lowerEstimate?: number;
  upperEstimate?: number;
  mainPicture?: string;
  pictures?: Array<string>;
  auctionHouseContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    auctioneer?: string;
    registrationRequired?: boolean;
    depositAmount?: number;
  };
  source: AuctionSource;
  occupationStatus: AuctionOccupationStatus;
}

// Listing type
export interface Listing extends BaseOpportunity {
  url: string;
  source: string;
  propertyType: PropertyType;
  lastChangeDate: string;
  description?: string;
  squareFootage?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  energyClass: EnergyClassType;
  constructionYear?: number;
  floor?: number;
  totalFloors?: number;
  options?: Array<string>;
  keywords?: Array<string>;
  isSoldRented: boolean;
  price?: number;
  priceType?: string;
  fees?: number;
  charges?: number;
  mainPicture?: string;
  pictures?: Array<string>;
  sellerType: 'individual' | 'professional';
  sellerContact?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contact?: string;
    siret?: string;
  };
}

// Succession type
export interface Succession extends BaseOpportunity {
  address: string;
  firstName: string;
  lastName: string;
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

// Liquidation type
export interface Liquidation extends BaseOpportunity {
  siret: string;
  address: string;
  companyContact?: {
    name?: string;
    phone?: string;
    email?: string;
    legalRepresentative?: string;
    administrateur?: string;
  };
}

// Energy Diagnostic type
export interface EnergyDiagnostic extends BaseOpportunity {
  energyClass: string;
  squareFootage: number;
  address: string;
}

// Union type for all opportunities
export type Opportunity =
  | Auction
  | Succession
  | Liquidation
  | EnergyDiagnostic
  | Listing;

// Input types (for creating new records)
export type AuctionInput = Omit<Auction, 'id' | 'createdAt' | 'updatedAt'>;
export type ListingInput = Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;
export type SuccessionInput = Omit<Succession, 'id' | 'createdAt' | 'updatedAt'>;
export type LiquidationInput = Omit<Liquidation, 'id' | 'createdAt' | 'updatedAt'>;
export type EnergyDiagnosticInput = Omit<EnergyDiagnostic, 'id' | 'createdAt' | 'updatedAt'>;
