import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema.js';
import { SuccessionInput } from '../types/succession.types.js';

// Schema for mairie contact info
const mairieContactSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  openingHours: z.string().optional(),
}).optional();

// Schema for succession input extending base opportunity
export const successionInputSchema = baseOpportunityInputSchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mairieContact: mairieContactSchema,
});

// Typed schema for coherent typing
export const typedSchema = successionInputSchema as z.ZodType<SuccessionInput>;