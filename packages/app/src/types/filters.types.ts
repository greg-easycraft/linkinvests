import type {
  OpportunityType,
  PropertyType,
  AuctionOccupationStatus,
  EnergyClass,
  EnergyClassType,
} from './opportunity.types';

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

export type DatePeriod =
  | 'last_month'
  | 'last_3_months'
  | '6_months'
  | '9_months'
  | '12_months'
  | '18_months'
  | '24_months';

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
  view?: 'list' | 'map';
  types?: OpportunityType[];
  departments?: string[];
  zipCodes?: string[];
  dateRange?: DateRange; // Legacy support
  datePeriod?: DatePeriod;
  bounds?: MapBounds;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationFilters {
  limit: number;
  offset: number;
}

export interface IEnergyDiagnosticFilters extends IOpportunityFilters {
  energyClasses?: EnergyClass[];
}

export interface PriceRange {
  min?: number;
  max?: number;
}

export interface IAuctionFilters extends IOpportunityFilters {
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

export interface ISuccessionFilters extends IOpportunityFilters {
  // Future: Add succession-specific filter properties here
}

export interface ILiquidationFilters extends IOpportunityFilters {
  // Future: Add liquidation-specific filter properties here
}

export interface ListingFeatures {
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  garage?: boolean;
  parking?: boolean;
  elevator?: boolean;
}

export interface IListingFilters extends IOpportunityFilters {
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
  energyClasses?: EnergyClassType[];
  features?: ListingFeatures;
  isSoldRented?: boolean;
  sources?: string[];
  sellerType?: 'individual' | 'professional';
}

// Query result types
export interface OpportunitiesDataQueryResult<T> {
  opportunities: T[];
  total?: number;
}
