import { z } from 'zod';
import { listingFiltersSchema } from './filters.schema';
import { baseExportRequestSchema } from './responses.schema';

// Listing search request
export const listingSearchRequestSchema = listingFiltersSchema;
export type ListingSearchRequest = z.infer<typeof listingSearchRequestSchema>;

// Listing count request
export const listingCountRequestSchema = listingFiltersSchema;
export type ListingCountRequest = z.infer<typeof listingCountRequestSchema>;

// Listing export request
export const listingExportRequestSchema = baseExportRequestSchema.extend({
  filters: listingFiltersSchema.optional(),
});
export type ListingExportRequest = z.infer<typeof listingExportRequestSchema>;
