import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { userQuickActions } from '@linkinvests/db';
import { UserQuickActionsRepository, type UserQuickActions } from '../lib.types';
import type { QuickActionId } from '@linkinvests/shared';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class UserQuickActionsRepositoryImpl implements UserQuickActionsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByUserId(userId: string): Promise<UserQuickActions | null> {
    const result = await this.db
      .select()
      .from(userQuickActions)
      .where(eq(userQuickActions.userId, userId))
      .limit(1);

    return result[0] ? this.mapUserQuickActions(result[0]) : null;
  }

  async upsert(userId: string, actions: QuickActionId[]): Promise<UserQuickActions> {
    const result = await this.db
      .insert(userQuickActions)
      .values({ userId, actions })
      .onConflictDoUpdate({
        target: userQuickActions.userId,
        set: { actions, updatedAt: new Date() },
      })
      .returning();

    return this.mapUserQuickActions(result[0]);
  }

  private mapUserQuickActions(
    row: typeof userQuickActions.$inferSelect,
  ): UserQuickActions {
    return {
      userId: row.userId,
      actions: row.actions as QuickActionId[],
    };
  }
}
