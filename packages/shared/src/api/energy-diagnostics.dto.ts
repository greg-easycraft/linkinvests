import { z } from 'zod';
import { energyDiagnosticFiltersSchema } from './filters.schema';
import { baseExportRequestSchema } from './responses.schema';

// Energy diagnostic search request
export const energyDiagnosticSearchRequestSchema =
  energyDiagnosticFiltersSchema;
export type EnergyDiagnosticSearchRequest = z.infer<
  typeof energyDiagnosticSearchRequestSchema
>;

// Energy diagnostic count request
export const energyDiagnosticCountRequestSchema = energyDiagnosticFiltersSchema;
export type EnergyDiagnosticCountRequest = z.infer<
  typeof energyDiagnosticCountRequestSchema
>;

// Energy diagnostic export request
export const energyDiagnosticExportRequestSchema =
  baseExportRequestSchema.extend({
    filters: energyDiagnosticFiltersSchema.optional(),
  });
export type EnergyDiagnosticExportRequest = z.infer<
  typeof energyDiagnosticExportRequestSchema
>;
