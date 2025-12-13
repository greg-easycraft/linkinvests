import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import type { DomainDbType } from '~/types/db';
import { favoriteEvents } from '@linkinvests/db';
import { FavoriteEventRepository } from '../lib.types';
import { DATABASE_TOKEN } from '~/common/database';
import type { FavoriteEvent } from '@linkinvests/shared';

@Injectable()
export class FavoriteEventRepositoryImpl implements FavoriteEventRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async create(
    favoriteId: string,
    eventType: string,
    createdBy: string,
  ): Promise<FavoriteEvent> {
    const result = await this.db
      .insert(favoriteEvents)
      .values({
        favoriteId,
        eventType,
        createdBy,
      })
      .returning();

    return this.mapFavoriteEvent(result[0]);
  }

  async findByFavoriteId(favoriteId: string): Promise<FavoriteEvent[]> {
    const results = await this.db
      .select()
      .from(favoriteEvents)
      .where(eq(favoriteEvents.favoriteId, favoriteId))
      .orderBy(desc(favoriteEvents.createdAt));

    return results.map((r) => this.mapFavoriteEvent(r));
  }

  private mapFavoriteEvent(
    event: typeof favoriteEvents.$inferSelect,
  ): FavoriteEvent {
    return {
      id: event.id,
      favoriteId: event.favoriteId,
      eventType: event.eventType,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
    };
  }
}
