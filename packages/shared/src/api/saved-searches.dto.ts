import { z } from 'zod';

export const savedSearchSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  name: z.string().min(1).max(256),
  url: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type SavedSearch = z.infer<typeof savedSearchSchema>;

export const createSavedSearchRequestSchema = z.object({
  name: z.string().min(1).max(256),
  url: z.string().min(1),
});

export type CreateSavedSearchRequest = z.infer<
  typeof createSavedSearchRequestSchema
>;

export const savedSearchListResponseSchema = z.object({
  savedSearches: z.array(savedSearchSchema),
});

export type SavedSearchListResponse = z.infer<
  typeof savedSearchListResponseSchema
>;
