import { EnergyClass, OpportunityType, PropertyType } from "@linkinvests/shared";
import { z } from "zod";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { DatePeriod } from "~/types/filters";


export const baseFiltersSchema = z.object({
    page: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    pageSize: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    view: z.enum(['list', 'map']).optional(),
    departments: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    zipCodes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    datePeriod: z.enum(DATE_PERIOD_OPTIONS.map(option => option.value) as [DatePeriod, ...DatePeriod[]]).optional(),
});

export const auctionFiltersSchema = baseFiltersSchema.extend({
    auctionTypes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    propertyTypes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    minPrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxPrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minReservePrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxReservePrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minSquareFootage: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxSquareFootage: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minRooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxRooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),

    isSoldRented: z.union([
        z.string().transform(val => val === 'true'),
        z.boolean()
    ]).optional(),
});

export const listingFiltersSchema = baseFiltersSchema.extend({
    propertyTypes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.enum(PropertyType))
    ]).optional(),

    minPrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxPrice: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minSquareFootage: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxSquareFootage: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minLandArea: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxLandArea: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minRooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxRooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minBedrooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxBedrooms: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    minConstructionYear: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    maxConstructionYear: z.string().transform(val => Number(val)).pipe(z.number()).optional(),
    energyClasses: z.union([
        z.string().transform(val => {
            const classes = val.split(',').filter(Boolean);
            return classes.filter(cls => ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(cls)) as EnergyClass[];
        }),
        z.array(z.enum(EnergyClass))
    ]).optional(),
    isSoldRented: z.union([
        z.string().transform(val => val === 'true'),
        z.boolean()
    ]).optional(),
    sources: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    sellerType: z.union([
        z.string().refine(val => ['individual', 'professional'].includes(val), {
            message: "sellerType must be 'individual' or 'professional'"
        }).transform(val => val as 'individual' | 'professional'),
        z.enum(['individual', 'professional'])
    ]).optional(),
});

export const energyDiagnosticFiltersSchema = baseFiltersSchema.extend({
    energyClasses: z.union([
        z.string().transform(val => {
            const classes = val.split(',').filter(Boolean);
            return classes.filter(cls => ['E', 'F', 'G'].includes(cls)) as EnergyClass[];
        }),
        z.array(z.enum(['E', 'F', 'G'] as EnergyClass[]))
    ]).optional(),
});

export const filtersSchemaByType: Record<OpportunityType, z.ZodSchema> = {
    [OpportunityType.AUCTION]: auctionFiltersSchema,
    [OpportunityType.REAL_ESTATE_LISTING]: listingFiltersSchema,
    [OpportunityType.ENERGY_SIEVE]: energyDiagnosticFiltersSchema,
    [OpportunityType.SUCCESSION]: baseFiltersSchema,
    [OpportunityType.LIQUIDATION]: baseFiltersSchema,
    [OpportunityType.DIVORCE]: baseFiltersSchema,
};