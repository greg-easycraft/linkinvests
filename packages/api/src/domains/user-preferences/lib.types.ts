import type { QuickActionId } from '@linkinvests/shared';

export interface UserQuickActions {
  userId: string;
  actions: QuickActionId[];
}

export abstract class UserQuickActionsRepository {
  abstract findByUserId(userId: string): Promise<UserQuickActions | null>;
  abstract upsert(userId: string, actions: QuickActionId[]): Promise<UserQuickActions>;
}
