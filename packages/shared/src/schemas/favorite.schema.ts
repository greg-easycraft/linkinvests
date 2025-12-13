import { z } from 'zod';
import { OpportunityType } from '../constants/opportunity.js';

export const addFavoriteSchema = z.object({
  opportunityId: z.uuid(),
  opportunityType: z.enum(OpportunityType),
});

export const removeFavoriteSchema = z.object({
  opportunityId: z.uuid(),
  opportunityType: z.enum(OpportunityType),
});

export const checkFavoriteSchema = z.object({
  opportunityId: z.uuid(),
  opportunityType: z.enum(OpportunityType),
});

export const checkBatchFavoritesSchema = z.object({
  opportunityIds: z.array(z.uuid()),
  opportunityType: z.enum(OpportunityType),
});

export const markEmailSentSchema = z.object({
  favoriteId: z.uuid(),
});

export type AddFavoriteRequest = z.infer<typeof addFavoriteSchema>;
export type RemoveFavoriteRequest = z.infer<typeof removeFavoriteSchema>;
export type CheckFavoriteRequest = z.infer<typeof checkFavoriteSchema>;
export type CheckBatchFavoritesRequest = z.infer<
  typeof checkBatchFavoritesSchema
>;
export type MarkEmailSentRequest = z.infer<typeof markEmailSentSchema>;
