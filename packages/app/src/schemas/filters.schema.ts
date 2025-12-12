import { z } from 'zod'
import type { DatePeriod } from '@/types'
import {
  AuctionOccupationStatus,
  EnergyClass,
  OpportunityType,
  PropertyType,
  UNKNOWN_ENERGY_CLASS,
} from '@/types'
import { DATE_PERIOD_OPTIONS } from '@/constants'
import {
  AUCTION_SORT_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  LISTING_SORT_OPTIONS,
} from '@/constants/sort-options'

// Helper to transform comma-separated string to array
const commaSeparatedToArray = z
  .string()
  .transform((val) => val.split(',').filter(Boolean))

// Helper for optional number from string
const optionalNumberFromString = z
  .union([z.string().transform((val) => Number(val)), z.number()])
  .optional()

// Helper for optional boolean from string
const optionalBooleanFromString = z
  .union([z.string().transform((val) => val === 'true'), z.boolean()])
  .optional()

// Base filters schema - common to all opportunity types
export const baseFiltersSchema = z.object({
  page: optionalNumberFromString,
  pageSize: optionalNumberFromString,
  view: z.enum(['list', 'map']).optional(),
  departments: z.union([commaSeparatedToArray, z.array(z.string())]).optional(),
  zipCodes: z.union([commaSeparatedToArray, z.array(z.string())]).optional(),
  dateAfter: z
    .enum(
      DATE_PERIOD_OPTIONS.map((option) => option.value) as [
        DatePeriod,
        ...Array<DatePeriod>,
      ],
    )
    .optional(),
  dateBefore: z
    .enum(
      DATE_PERIOD_OPTIONS.map((option) => option.value) as [
        DatePeriod,
        ...Array<DatePeriod>,
      ],
    )
    .optional(),
  sortBy: z
    .enum(
      DEFAULT_SORT_OPTIONS.map((option) => option.sortBy) as [
        string,
        ...Array<string>,
      ],
    )
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

// Property types schema
const propertyTypesSchema = z
  .union([
    z
      .string()
      .transform(
        (val) => val.split(',').filter(Boolean) as Array<PropertyType>,
      ),
    z.array(z.enum(PropertyType)),
  ])
  .optional()

// Energy classes schema (all classes)
const energyClassesSchema = z
  .union([
    z.string().transform((val) => {
      const classes = val.split(',').filter(Boolean)
      return classes.filter((cls) =>
        [
          UNKNOWN_ENERGY_CLASS,
          EnergyClass.A,
          EnergyClass.B,
          EnergyClass.C,
          EnergyClass.D,
          EnergyClass.E,
          EnergyClass.F,
          EnergyClass.G,
        ].includes(cls as EnergyClass | typeof UNKNOWN_ENERGY_CLASS),
      )
    }),
    z.array(
      z.union([z.literal(UNKNOWN_ENERGY_CLASS), z.enum(EnergyClass)]),
    ),
  ])
  .optional()

// Auction filters schema
export const auctionFiltersSchema = baseFiltersSchema.extend({
  propertyTypes: propertyTypesSchema,
  minPrice: optionalNumberFromString,
  maxPrice: optionalNumberFromString,
  minReservePrice: optionalNumberFromString,
  maxReservePrice: optionalNumberFromString,
  minSquareFootage: optionalNumberFromString,
  maxSquareFootage: optionalNumberFromString,
  minRooms: optionalNumberFromString,
  maxRooms: optionalNumberFromString,
  occupationStatuses: z
    .union([
      z
        .string()
        .transform(
          (val) =>
            val.split(',').filter(Boolean) as Array<AuctionOccupationStatus>,
        ),
      z.array(z.enum(AuctionOccupationStatus)),
    ])
    .optional(),
  energyClasses: energyClassesSchema,
  sortBy: z
    .enum(
      AUCTION_SORT_OPTIONS.map((option) => option.sortBy) as [
        string,
        ...Array<string>,
      ],
    )
    .optional(),
})

// Listing filters schema
export const listingFiltersSchema = baseFiltersSchema.extend({
  propertyTypes: propertyTypesSchema,
  minPrice: optionalNumberFromString,
  maxPrice: optionalNumberFromString,
  minSquareFootage: optionalNumberFromString,
  maxSquareFootage: optionalNumberFromString,
  minLandArea: optionalNumberFromString,
  maxLandArea: optionalNumberFromString,
  minRooms: optionalNumberFromString,
  maxRooms: optionalNumberFromString,
  minBedrooms: optionalNumberFromString,
  maxBedrooms: optionalNumberFromString,
  minConstructionYear: optionalNumberFromString,
  maxConstructionYear: optionalNumberFromString,
  energyClasses: energyClassesSchema,
  isSoldRented: optionalBooleanFromString,
  isDivisible: optionalBooleanFromString,
  hasWorksRequired: optionalBooleanFromString,
  sources: z.union([commaSeparatedToArray, z.array(z.string())]).optional(),
  sellerType: z
    .union([
      z
        .string()
        .refine((val) => ['individual', 'professional'].includes(val))
        .transform((val) => val as 'individual' | 'professional'),
      z.enum(['individual', 'professional']),
    ])
    .optional(),
  sortBy: z
    .enum(
      LISTING_SORT_OPTIONS.map((option) => option.sortBy) as [
        string,
        ...Array<string>,
      ],
    )
    .optional(),
})

// Energy diagnostic filters schema
export const energyDiagnosticFiltersSchema = baseFiltersSchema.extend({
  energyClasses: z
    .union([
      z.string().transform((val) => {
        const classes = val.split(',').filter(Boolean)
        return classes.filter((cls) =>
          [EnergyClass.E, EnergyClass.F, EnergyClass.G].includes(
            cls as EnergyClass,
          ),
        ) as Array<EnergyClass>
      }),
      z.array(
        z.enum([EnergyClass.E, EnergyClass.F, EnergyClass.G] as [
          EnergyClass,
          ...Array<EnergyClass>,
        ]),
      ),
    ])
    .optional(),
})

// Succession and Liquidation use base filters
export const successionFiltersSchema = baseFiltersSchema
export const liquidationFiltersSchema = baseFiltersSchema

// Opportunity types schema helper
const opportunityTypesSchema = z
  .union([
    z
      .string()
      .transform(
        (val) => val.split(',').filter(Boolean) as Array<OpportunityType>,
      ),
    z.array(z.nativeEnum(OpportunityType)),
  ])
  .optional()

// Unified search filters schema (for /search route with multi-type selection)
export const unifiedSearchFiltersSchema = baseFiltersSchema.extend({
  types: opportunityTypesSchema,
  // Extended filters (shown based on type intersection)
  propertyTypes: propertyTypesSchema,
  energyClasses: energyClassesSchema,
  minSquareFootage: optionalNumberFromString,
  maxSquareFootage: optionalNumberFromString,
  minPrice: optionalNumberFromString,
  maxPrice: optionalNumberFromString,
  minRooms: optionalNumberFromString,
  maxRooms: optionalNumberFromString,
  // Auction-specific
  minReservePrice: optionalNumberFromString,
  maxReservePrice: optionalNumberFromString,
  occupationStatuses: z
    .union([
      z
        .string()
        .transform(
          (val) =>
            val.split(',').filter(Boolean) as Array<AuctionOccupationStatus>,
        ),
      z.array(z.enum(AuctionOccupationStatus)),
    ])
    .optional(),
  // Listing-specific
  minLandArea: optionalNumberFromString,
  maxLandArea: optionalNumberFromString,
  minBedrooms: optionalNumberFromString,
  maxBedrooms: optionalNumberFromString,
  minConstructionYear: optionalNumberFromString,
  maxConstructionYear: optionalNumberFromString,
  isSoldRented: optionalBooleanFromString,
  isDivisible: optionalBooleanFromString,
  hasWorksRequired: optionalBooleanFromString,
  sources: z.union([commaSeparatedToArray, z.array(z.string())]).optional(),
  sellerType: z
    .union([
      z
        .string()
        .refine((val) => ['individual', 'professional'].includes(val))
        .transform((val) => val as 'individual' | 'professional'),
      z.enum(['individual', 'professional']),
    ])
    .optional(),
})

// Schema map by opportunity type
export const filtersSchemaByType: Record<OpportunityType, z.ZodSchema> = {
  [OpportunityType.AUCTION]: auctionFiltersSchema,
  [OpportunityType.REAL_ESTATE_LISTING]: listingFiltersSchema,
  [OpportunityType.ENERGY_SIEVE]: energyDiagnosticFiltersSchema,
  [OpportunityType.SUCCESSION]: successionFiltersSchema,
  [OpportunityType.LIQUIDATION]: liquidationFiltersSchema,
  [OpportunityType.DIVORCE]: baseFiltersSchema,
}

// Inferred types from schemas
export type BaseFilters = z.infer<typeof baseFiltersSchema>
export type AuctionFilters = z.infer<typeof auctionFiltersSchema>
export type ListingFilters = z.infer<typeof listingFiltersSchema>
export type EnergyDiagnosticFilters = z.infer<
  typeof energyDiagnosticFiltersSchema
>
export type SuccessionFilters = z.infer<typeof successionFiltersSchema>
export type LiquidationFilters = z.infer<typeof liquidationFiltersSchema>
export type UnifiedSearchFilters = z.infer<typeof unifiedSearchFiltersSchema>
