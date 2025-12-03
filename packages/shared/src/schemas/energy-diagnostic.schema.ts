import z from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema';
import { EnergyDiagnosticInput } from '../types/energy-diagnostic.types';

export const energyDiagnosticInputSchema = baseOpportunityInputSchema.extend({
  energyClass: z.string(),
  squareFootage: z.number(),
  address: z.string(),
});

// Necessary to ensure coherent typing
export const typedSchema =
  energyDiagnosticInputSchema as z.ZodType<EnergyDiagnosticInput>;
