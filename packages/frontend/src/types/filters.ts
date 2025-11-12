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
  types?: OpportunityType[];
  departments?: string[];
  zipCodes?: string[];
  dateRange?: DateRange; // Legacy support - uses 'from' date as threshold
  datePeriod?: DatePeriod; // New predefined period - filters for opportunities after start date
  bounds?: MapBounds;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Energy diagnostics specific filters
  energyClasses?: EnergyClass[];
}

export interface EnergyDiagnosticFilters extends OpportunityFilters {
  energyClasses?: EnergyClass[];
}

// Placeholder for future auction-specific filters
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuctionFilters extends OpportunityFilters {
  // Future: Add auction-specific filter properties here
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