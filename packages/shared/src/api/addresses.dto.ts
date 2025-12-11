import { z } from 'zod';
import { EnergyClass } from '../constants';

// Opportunity type for address linking (different from the broader OpportunityType enum)
export const addressLinkOpportunityTypeSchema = z.enum(['auction', 'listing']);
export type AddressLinkOpportunityType = z.infer<
  typeof addressLinkOpportunityTypeSchema
>;

// Address search input schema (validates same fields as AddressSearchInput interface, minus photo)
export const addressSearchInputSchema = z.object({
  energyClass: z.enum(EnergyClass),
  squareFootage: z.number().positive(),
  zipCode: z.string().min(5).max(5),
  address: z.string().optional(),
});

// Search and link request
export const addressLinkRequestSchema = z.object({
  input: addressSearchInputSchema,
  opportunityId: z.uuid(),
  opportunityType: addressLinkOpportunityTypeSchema,
});
export type AddressLinkRequest = z.infer<typeof addressLinkRequestSchema>;

// Get diagnostic links request
export const getDiagnosticLinksParamsSchema = z.object({
  opportunityId: z.uuid(),
});
export type GetDiagnosticLinksParams = z.infer<
  typeof getDiagnosticLinksParamsSchema
>;

export const getDiagnosticLinksQuerySchema = z.object({
  opportunityType: addressLinkOpportunityTypeSchema,
});
export type GetDiagnosticLinksQuery = z.infer<
  typeof getDiagnosticLinksQuerySchema
>;
