import { z } from 'zod';
import {
  EnergyClass,
  GazClass,
  PropertyType,
  AuctionOccupationStatus,
  OpportunityType,
} from '../constants';

// Date period enum
export const datePeriodSchema = z.enum([
  '7d',
  '30d',
  '90d',
  '6m',
  '1y',
  'all',
  'last_month',
  'last_3_months',
  '6_months',
  '9_months',
  '12_months',
  '18_months',
  '24_months',
]);

export type DatePeriod = z.infer<typeof datePeriodSchema>;

// Map bounds for geographic filtering
export const mapBoundsSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

export type MapBounds = z.infer<typeof mapBoundsSchema>;

// Base opportunity filters (shared across all opportunity types)
export const baseOpportunityFiltersSchema = z.object({
  departments: z.array(z.string()).optional(),
  zipCodes: z.array(z.string()).optional(),
  dateAfter: datePeriodSchema.optional(),
  dateBefore: datePeriodSchema.optional(),
  bounds: mapBoundsSchema.optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(200).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type BaseOpportunityFilters = z.infer<
  typeof baseOpportunityFiltersSchema
>;

// Auction filters
export const auctionFiltersSchema = baseOpportunityFiltersSchema.extend({
  propertyTypes: z.array(z.enum(PropertyType)).optional(),
  auctionVenues: z.array(z.string()).optional(),
  energyClasses: z.array(z.enum(EnergyClass)).optional(),
  gazClasses: z.array(z.enum(GazClass)).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minReservePrice: z.number().nonnegative().optional(),
  maxReservePrice: z.number().nonnegative().optional(),
  minSquareFootage: z.number().nonnegative().optional(),
  maxSquareFootage: z.number().nonnegative().optional(),
  minRooms: z.number().int().nonnegative().optional(),
  maxRooms: z.number().int().nonnegative().optional(),
  occupationStatuses: z.array(z.enum(AuctionOccupationStatus)).optional(),
});

export type AuctionFilters = z.infer<typeof auctionFiltersSchema>;

// Listing filters
export const listingFiltersSchema = baseOpportunityFiltersSchema.extend({
  propertyTypes: z.array(z.enum(PropertyType)).optional(),
  energyClasses: z.array(z.enum(EnergyClass)).optional(),
  gazClasses: z.array(z.enum(GazClass)).optional(),
  sources: z.array(z.string()).optional(),
  sellerType: z.enum(['individual', 'professional']).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  minSquareFootage: z.number().nonnegative().optional(),
  maxSquareFootage: z.number().nonnegative().optional(),
  minLandArea: z.number().nonnegative().optional(),
  maxLandArea: z.number().nonnegative().optional(),
  minRooms: z.number().int().nonnegative().optional(),
  maxRooms: z.number().int().nonnegative().optional(),
  minBedrooms: z.number().int().nonnegative().optional(),
  maxBedrooms: z.number().int().nonnegative().optional(),
  minConstructionYear: z.number().int().optional(),
  maxConstructionYear: z.number().int().optional(),
  isSoldRented: z.boolean().optional(),
  isDivisible: z.boolean().optional(),
  hasWorksRequired: z.boolean().optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;

// Succession filters (same as base)
export const successionFiltersSchema = baseOpportunityFiltersSchema;
export type SuccessionFilters = z.infer<typeof successionFiltersSchema>;

// Liquidation filters (same as base)
export const liquidationFiltersSchema = baseOpportunityFiltersSchema;
export type LiquidationFilters = z.infer<typeof liquidationFiltersSchema>;

// Energy diagnostic filters
export const energyDiagnosticFiltersSchema =
  baseOpportunityFiltersSchema.extend({
    energyClasses: z.array(z.enum(EnergyClass)).optional(),
    gazClasses: z.array(z.enum(GazClass)).optional(),
    minSquareFootage: z.number().nonnegative().optional(),
    maxSquareFootage: z.number().nonnegative().optional(),
  });

export type EnergyDiagnosticFilters = z.infer<
  typeof energyDiagnosticFiltersSchema
>;

// All opportunities filters (unified search)
export const allOpportunitiesFiltersSchema =
  baseOpportunityFiltersSchema.extend({
    types: z.array(z.enum(OpportunityType)).optional(),
    energyClasses: z.array(z.enum(EnergyClass)).optional(),
    minSquareFootage: z.number().nonnegative().optional(),
    maxSquareFootage: z.number().nonnegative().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
  });

export type AllOpportunitiesFilters = z.infer<
  typeof allOpportunitiesFiltersSchema
>;
