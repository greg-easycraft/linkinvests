import z from 'zod';
import { baseOpportunityInputSchema } from './base-opportunity.schema';
import { EnergyDiagnosticInput } from '../types/energy-diagnostic.types';
import { EnergyClass, GazClass } from '../constants/opportunity';

export const energyDiagnosticInputSchema = baseOpportunityInputSchema.extend({
  energyClass: z.enum(EnergyClass),
  gazClass: z.enum(GazClass),
  squareFootage: z.number(),
  address: z.string(),
});

// Necessary to ensure coherent typing
export const typedSchema =
  energyDiagnosticInputSchema as z.ZodType<EnergyDiagnosticInput>;
