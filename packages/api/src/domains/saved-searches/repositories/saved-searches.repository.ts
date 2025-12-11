import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { savedSearches } from '@linkinvests/db';
import { SavedSearchRepository } from '../lib.types';
import type { SavedSearch } from '@linkinvests/shared';
import { DATABASE_TOKEN } from '~/common/database';

@Injectable()
export class DrizzleSavedSearchRepository implements SavedSearchRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findAllByUserId(userId: string): Promise<SavedSearch[]> {
    const results = await this.db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));

    return results.map(this.mapSavedSearch);
  }

  async findById(id: string): Promise<SavedSearch | null> {
    const result = await this.db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.id, id))
      .limit(1);

    return result[0] ? this.mapSavedSearch(result[0]) : null;
  }

  async create(data: {
    userId: string;
    name: string;
    url: string;
  }): Promise<SavedSearch> {
    const result = await this.db
      .insert(savedSearches)
      .values(data)
      .returning();

    return this.mapSavedSearch(result[0]!);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(savedSearches)
      .where(eq(savedSearches.id, id))
      .returning({ id: savedSearches.id });

    return result.length > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId));

    return result[0]?.count ?? 0;
  }

  private mapSavedSearch(
    row: typeof savedSearches.$inferSelect,
  ): SavedSearch {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      url: row.url,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
