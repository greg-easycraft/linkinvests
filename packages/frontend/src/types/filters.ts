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

export interface OpportunityFilters {
  types?: OpportunityType[];
  status?: string;
  department?: number;
  zipCode?: number;
  dateRange?: DateRange;
  bounds?: MapBounds;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
