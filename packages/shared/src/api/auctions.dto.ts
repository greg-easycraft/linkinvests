import { z } from 'zod';
import { auctionFiltersSchema } from './filters.schema';
import { baseExportRequestSchema } from './responses.schema';

// Auction search request
export const auctionSearchRequestSchema = auctionFiltersSchema;
export type AuctionSearchRequest = z.infer<typeof auctionSearchRequestSchema>;

// Auction count request
export const auctionCountRequestSchema = auctionFiltersSchema;
export type AuctionCountRequest = z.infer<typeof auctionCountRequestSchema>;

// Auction export request
export const auctionExportRequestSchema = baseExportRequestSchema.extend({
  filters: auctionFiltersSchema.optional(),
});
export type AuctionExportRequest = z.infer<typeof auctionExportRequestSchema>;
