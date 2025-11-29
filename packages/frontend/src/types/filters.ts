import type { OpportunityType, PropertyType, AuctionOccupationStatus, EnergyClass, EnergyClassType } from "@linkinvests/shared";

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

export interface IOpportunityFilters {
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

export interface IEnergyDiagnosticFilters extends IOpportunityFilters {
  energyClasses?: EnergyClass[];
}

// Price range interface for auction filters
export interface PriceRange {
  min?: number;
  max?: number;
}

export interface IAuctionFilters extends IOpportunityFilters {
  // Auction-specific filter properties
  propertyTypes?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minReservePrice?: number;
  maxReservePrice?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minRooms?: number;
  maxRooms?: number;
  auctionVenues?: string[];
  energyClasses?: EnergyClassType[];
  occupationStatuses?: AuctionOccupationStatus[];
}

// Placeholder for future succession-specific filters
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ISuccessionFilters extends IOpportunityFilters {
  // Future: Add succession-specific filter properties here
}

// Placeholder for future liquidation-specific filters
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILiquidationFilters extends IOpportunityFilters {
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

export interface IListingFilters extends IOpportunityFilters {
  // Listing-specific filter properties
  propertyTypes?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minLandArea?: number;
  maxLandArea?: number;
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minConstructionYear?: number;
  maxConstructionYear?: number;
  isDivisible?: boolean;
  hasWorksRequired?: boolean;
  energyClasses?: EnergyClassType[]; // Energy performance diagnosis (A-G)
  features?: ListingFeatures; // Boolean features like balcony, garage, etc.
  isSoldRented?: boolean; // Rental status: true for occupied, false for available
  sources?: string[]; // Source of the listing (dynamic options from database)
  sellerType?: 'individual' | 'professional'; // Type of seller: individual or professional
}