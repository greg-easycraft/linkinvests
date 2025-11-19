import type { OpportunityType } from "@linkinvests/shared";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type DatePeriod = "last_month" | "last_3_months" | "6_months" | "9_months" | "12_months" | "18_months" | "24_months";

export interface DatePeriodOption {
  value: DatePeriod;
  label: string;
  months: number;
}

export interface DepartmentOption {
  id: string;
  name: string;
  label: string; // Formatted as "ID - Name" for display
}

// Energy class type for energy diagnostics
export type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface OpportunityFilters {
  view?: "list" | "map";
  types?: OpportunityType[];
  departments?: string[];
  zipCodes?: string[];
  dateRange?: DateRange; // Legacy support - uses 'from' date as threshold
  datePeriod?: DatePeriod; // New predefined period - filters for opportunities after start date
  bounds?: MapBounds;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationFilters {
  limit: number;
  offset: number;
}

export interface EnergyDiagnosticFilters extends OpportunityFilters {
  energyClasses?: EnergyClass[];
}

// Price range interface for auction filters
export interface PriceRange {
  min?: number;
  max?: number;
}

export interface AuctionFilters extends OpportunityFilters {
  // Auction-specific filter properties
  auctionTypes?: string[];
  propertyTypes?: string[];
  priceRange?: PriceRange;
  reservePriceRange?: PriceRange;
  squareFootageRange?: PriceRange; // Reusing PriceRange for number ranges
  roomsRange?: PriceRange; // Reusing PriceRange for number ranges
  auctionVenues?: string[];
  energyClasses?: EnergyClass[];
}

// Placeholder for future succession-specific filters
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SuccessionFilters extends OpportunityFilters {
  // Future: Add succession-specific filter properties here
}

// Placeholder for future liquidation-specific filters
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LiquidationFilters extends OpportunityFilters {
  // Future: Add liquidation-specific filter properties here
}

// Listing features interface
export interface ListingFeatures {
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;
}

export interface ListingFilters extends OpportunityFilters {
  // Listing-specific filter properties
  transactionTypes?: string[]; // VENTE, VENTE_EN_L_ETAT_FUTUR_D_ACHEVEMENT, VENTE_AUX_ENCHERES
  propertyTypes?: string[]; // APP, MAI, TER, etc.
  priceRange?: PriceRange;
  squareFootageRange?: PriceRange; // Reusing PriceRange for number ranges
  landAreaRange?: PriceRange; // Reusing PriceRange for number ranges
  roomsRange?: PriceRange; // Reusing PriceRange for number ranges
  bedroomsRange?: PriceRange; // Reusing PriceRange for number ranges
  constructionYearRange?: PriceRange; // Reusing PriceRange for year ranges
  energyClasses?: EnergyClass[]; // Energy performance diagnosis (A-G)
  features?: ListingFeatures; // Boolean features like balcony, garage, etc.
}