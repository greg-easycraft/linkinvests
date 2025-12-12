import { z } from 'zod';

// Available quick action IDs
export const quickActionIds = [
  'new_search',
  'auctions',
  'listings',
  'successions',
  'liquidations',
  'energy_sieves',
  'address_search',
  'favorites',
  'admin',
] as const;

export type QuickActionId = (typeof quickActionIds)[number];

// Schema for validating quick action IDs
export const quickActionIdSchema = z.enum(quickActionIds);

// Default quick actions
export const DEFAULT_QUICK_ACTIONS: QuickActionId[] = [
  'new_search',
  'auctions',
  'address_search',
];

// Response type for GET /user-preferences/quick-actions
export const userQuickActionsResponseSchema = z.object({
  actions: z.array(quickActionIdSchema),
});

export type UserQuickActionsResponse = z.infer<
  typeof userQuickActionsResponseSchema
>;

// Request type for PUT /user-preferences/quick-actions
export const updateQuickActionsRequestSchema = z.object({
  actions: z
    .array(quickActionIdSchema)
    .length(3, 'Exactly 3 actions must be selected'),
});

export type UpdateQuickActionsRequest = z.infer<
  typeof updateQuickActionsRequestSchema
>;
