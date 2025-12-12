import type {
  AuctionOccupationStatus,
  EnergyClass,
  EnergyClassType,
  GazClass,
  GazClassType,
  OpportunityType,
  PropertyType,
} from '../constants/opportunity';
import type { DatePeriod, MapBounds } from '../api/filters.schema';

// Re-export DatePeriod and MapBounds from API schemas
export type { DatePeriod, MapBounds };

export interface DatePeriodOption {
  value: DatePeriod;
  label: string;
  months: number;
}

export interface DepartmentOption {
  id: string;
  name: string;
  label: string;
}

export interface PaginationFilters {
  limit: number;
  offset: number;
}

export interface IOpportunityFilters {
  view?: 'list' | 'map';
  types?: Array<OpportunityType>;
  departments?: string[];
  zipCodes?: string[];
  dateAfter?: DatePeriod;
  dateBefore?: DatePeriod;
  bounds?: MapBounds;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PriceRange {
  min?: number;
  max?: number;
}

export interface IAuctionFilters extends IOpportunityFilters {
  propertyTypes?: PropertyType[];
  auctionVenues?: string[];
  energyClasses?: (EnergyClass | EnergyClassType)[];
  gazClasses?: (GazClass | GazClassType)[];
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
  energyClasses?: (EnergyClass | EnergyClassType)[];
  gazClasses?: (GazClass | GazClassType)[];
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
  features?: ListingFeatures;
}

export interface ISuccessionFilters extends IOpportunityFilters {}

export interface ILiquidationFilters extends IOpportunityFilters {}

export interface IEnergyDiagnosticFilters extends IOpportunityFilters {
  energyClasses?: EnergyClass[];
  gazClasses?: GazClass[];
  minSquareFootage?: number;
  maxSquareFootage?: number;
}

export interface IAllOpportunitiesFilters extends IOpportunityFilters {
  types?: OpportunityType[];
  energyClasses?: (EnergyClass | EnergyClassType)[];
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface OpportunitiesDataQueryResult<T> {
  opportunities: Array<T>;
  total?: number;
}
