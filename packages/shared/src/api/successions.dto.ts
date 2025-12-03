import { z } from 'zod';
import { successionFiltersSchema } from './filters.schema';
import { baseExportRequestSchema } from './responses.schema';

// Succession search request
export const successionSearchRequestSchema = successionFiltersSchema;
export type SuccessionSearchRequest = z.infer<
  typeof successionSearchRequestSchema
>;

// Succession count request
export const successionCountRequestSchema = successionFiltersSchema;
export type SuccessionCountRequest = z.infer<
  typeof successionCountRequestSchema
>;

// Succession export request
export const successionExportRequestSchema = baseExportRequestSchema.extend({
  filters: successionFiltersSchema.optional(),
});
export type SuccessionExportRequest = z.infer<
  typeof successionExportRequestSchema
>;
