import { z } from 'zod';
import { liquidationFiltersSchema } from './filters.schema';
import { baseExportRequestSchema } from './responses.schema';

// Liquidation search request
export const liquidationSearchRequestSchema = liquidationFiltersSchema;
export type LiquidationSearchRequest = z.infer<
  typeof liquidationSearchRequestSchema
>;

// Liquidation count request
export const liquidationCountRequestSchema = liquidationFiltersSchema;
export type LiquidationCountRequest = z.infer<
  typeof liquidationCountRequestSchema
>;

// Liquidation export request
export const liquidationExportRequestSchema = baseExportRequestSchema.extend({
  filters: liquidationFiltersSchema.optional(),
});
export type LiquidationExportRequest = z.infer<
  typeof liquidationExportRequestSchema
>;
