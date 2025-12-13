import { z } from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema';
import { SuccessionInput } from '../types/succession.types';

// Schema for mairie contact info
const mairieContactSchema = z
  .object({
    name: z.string().optional(),
    address: z
      .object({
        complement1: z.string(),
        complement2: z.string().optional(),
        numero_voie: z.string(),
        service_distribution: z.string(),
        code_postal: z.string(),
        nom_commune: z.string(),
      })
      .optional(),
    phone: z.string().optional(),
    email: z.email().optional(),
    website: z.url().optional(),
    openingHours: z.string().optional(),
  })
  .optional();

// Schema for succession input extending base opportunity
export const successionInputSchema = baseOpportunityInputSchema.extend({
  streetAddress: z.string(), // Required for successions (override optional from base)
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mairieContact: mairieContactSchema,
});

// Typed schema for coherent typing
export const typedSchema = successionInputSchema as z.ZodType<SuccessionInput>;
