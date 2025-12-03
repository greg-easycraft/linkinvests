import type {
  EnergyClass,
  PropertyType,
  AuctionOccupationStatus,
} from '@linkinvests/shared';

export type DatePeriod =
  | '7d'
  | '30d'
  | '90d'
  | '6m'
  | '1y'
  | 'all'
  | 'last_month'
  | 'last_3_months'
  | '6_months'
  | '9_months'
  | '12_months';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PaginationFilters {
  limit: number;
  offset: number;
}

export interface IOpportunityFilters {
  departments?: string[];
  zipCodes?: string[];
  datePeriod?: DatePeriod;
  bounds?: MapBounds;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAuctionFilters extends IOpportunityFilters {
  propertyTypes?: PropertyType[];
  auctionVenues?: string[];
  energyClasses?: EnergyClass[];
  minPrice?: number;
  maxPrice?: number;
  minReservePrice?: number;
  maxReservePrice?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minRooms?: number;
  maxRooms?: number;
  occupationStatuses?: AuctionOccupationStatus[];
}

export interface IListingFilters extends IOpportunityFilters {
  propertyTypes?: PropertyType[];
  energyClasses?: EnergyClass[];
  sources?: string[];
  sellerType?: 'individual' | 'professional';
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
  isSoldRented?: boolean;
  isDivisible?: boolean;
  hasWorksRequired?: boolean;
}

export interface ISuccessionFilters extends IOpportunityFilters {}

export interface ILiquidationFilters extends IOpportunityFilters {}

export interface IEnergyDiagnosticFilters extends IOpportunityFilters {
  energyClasses?: EnergyClass[];
  minSquareFootage?: number;
  maxSquareFootage?: number;
}
