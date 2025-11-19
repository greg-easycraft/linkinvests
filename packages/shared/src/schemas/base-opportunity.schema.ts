import { z } from 'zod';
import { BaseOpportunityInput } from '../types/base-opportunity.types.js';

export const baseOpportunityInputSchema = z.object({
  label: z.string(),
  address: z.string().optional(),
  zipCode: z.string().min(5).max(5),
  department: z.string().min(2).max(3),
  latitude: z.number(),
  longitude: z.number(),
  opportunityDate: z.string(),
  externalId: z.string(),
});

// Necessary to ensure coherent typing
export const typedSchema = baseOpportunityInputSchema as z.ZodType<BaseOpportunityInput>;