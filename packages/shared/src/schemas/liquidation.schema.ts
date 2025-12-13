import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema';
import { LiquidationInput } from '../types/liquidation.types';

// Schema for company contact info
const companyContactSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.email().optional(),
    legalRepresentative: z.string().optional(),
    administrateur: z.string().optional(),
  })
  .optional();

// Schema for liquidation input extending base opportunity
export const liquidationInputSchema = baseOpportunityInputSchema.extend({
  siret: z.string().min(14).max(14), // SIRET is always 14 digits
  streetAddress: z.string(), // Required for liquidations (override optional from base)
  companyContact: companyContactSchema,
});

// Typed schema for coherent typing
export const typedSchema =
  liquidationInputSchema as z.ZodType<LiquidationInput>;
