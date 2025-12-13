import { Injectable, Inject } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { favorites } from '@linkinvests/db';
import { FavoriteRepository } from '../lib.types';
import { DATABASE_TOKEN } from '~/common/database';
import type { OpportunityType, Favorite } from '@linkinvests/shared';

@Injectable()
export class FavoriteRepositoryImpl implements FavoriteRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async add(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<Favorite> {
    const result = await this.db
      .insert(favorites)
      .values({
        userId,
        opportunityId,
        opportunityType,
      })
      .returning();

    return this.mapFavorite(result[0]);
  }

  async remove(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<boolean> {
    const result = await this.db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.opportunityId, opportunityId),
          eq(favorites.opportunityType, opportunityType),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async exists(
    userId: string,
    opportunityId: string,
    opportunityType: OpportunityType,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: favorites.id })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.opportunityId, opportunityId),
          eq(favorites.opportunityType, opportunityType),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    const results = await this.db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(favorites.createdAt);

    return results.map((r) => this.mapFavorite(r));
  }

  async findByUserAndType(
    userId: string,
    opportunityType: OpportunityType,
  ): Promise<Favorite[]> {
    const results = await this.db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.opportunityType, opportunityType),
        ),
      )
      .orderBy(favorites.createdAt);

    return results.map((r) => this.mapFavorite(r));
  }

  async checkMultiple(
    userId: string,
    opportunityIds: string[],
    opportunityType: OpportunityType,
  ): Promise<Set<string>> {
    if (opportunityIds.length === 0) {
      return new Set();
    }

    const results = await this.db
      .select({ opportunityId: favorites.opportunityId })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.opportunityType, opportunityType),
          inArray(favorites.opportunityId, opportunityIds),
        ),
      );

    return new Set(results.map((r) => r.opportunityId));
  }

  async findById(id: string): Promise<Favorite | null> {
    const result = await this.db
      .select()
      .from(favorites)
      .where(eq(favorites.id, id))
      .limit(1);

    return result[0] ? this.mapFavorite(result[0]) : null;
  }

  async updateStatus(id: string, status: string): Promise<Favorite | null> {
    const result = await this.db
      .update(favorites)
      .set({
        status,
        statusUpdatedAt: new Date(),
      })
      .where(eq(favorites.id, id))
      .returning();

    return result[0] ? this.mapFavorite(result[0]) : null;
  }

  private mapFavorite(favorite: typeof favorites.$inferSelect): Favorite {
    return {
      id: favorite.id,
      userId: favorite.userId,
      opportunityId: favorite.opportunityId,
      opportunityType: favorite.opportunityType as OpportunityType,
      status: favorite.status,
      statusUpdatedAt: favorite.statusUpdatedAt,
      createdAt: favorite.createdAt,
    };
  }
}
