import { OpportunityType } from "@linkinvests/shared";
import { z } from "zod";
import { DATE_PERIOD_OPTIONS } from "~/constants/date-periods";
import { DatePeriod, EnergyClass } from "~/types/filters";


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
    priceRange: z.union([
        z.string().transform(val => {
            try {
                const parsed = JSON.parse(val);
                return {
                    min: parsed.min ? Number(parsed.min) : undefined,
                    max: parsed.max ? Number(parsed.max) : undefined,
                };
            } catch {
                return undefined;
            }
        }),
        z.object({
            min: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
            max: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
        })
    ]).optional(),
    reservePriceRange: z.union([
        z.string().transform(val => {
            try {
                const parsed = JSON.parse(val);
                return {
                    min: parsed.min ? Number(parsed.min) : undefined,
                    max: parsed.max ? Number(parsed.max) : undefined,
                };
            } catch {
                return undefined;
            }
        }),
        z.object({
            min: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
            max: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
        })
    ]).optional(),
});

export const listingFiltersSchema = baseFiltersSchema.extend({
    transactionTypes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    propertyTypes: z.union([
        z.string().transform(val => val.split(',').filter(Boolean)),
        z.array(z.string())
    ]).optional(),
    priceRange: z.union([
        z.string().transform(val => {
            try {
                const parsed = JSON.parse(val);
                return {
                    min: parsed.min ? Number(parsed.min) : undefined,
                    max: parsed.max ? Number(parsed.max) : undefined,
                };
            } catch {
                return undefined;
            }
        }),
        z.object({
            min: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
            max: z.union([z.string().transform(val => Number(val)), z.number()]).optional(),
        })
    ]).optional(),
});

export const energyDiagnosticFiltersSchema = baseFiltersSchema.extend({
    energyClasses: z.union([
        z.string().transform(val => {
            const classes = val.split(',').filter(Boolean);
            return classes.filter(cls => ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(cls)) as EnergyClass[];
        }),
        z.array(z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const))
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