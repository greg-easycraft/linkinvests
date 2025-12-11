import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { opportunitySuccessions } from '@linkinvests/db';
import type { Succession } from '@linkinvests/shared';

import { DATABASE_TOKEN } from '~/common/database';
import type { DomainDbType } from '~/types/db';

import { FavoriteSuccessionRepository } from '../lib.types';

@Injectable()
export class FavoriteSuccessionRepositoryImpl implements FavoriteSuccessionRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByIds(ids: Array<string>): Promise<Array<Succession>> {
    if (ids.length === 0) return [];

    const results = await this.db
      .select()
      .from(opportunitySuccessions)
      .where(inArray(opportunitySuccessions.id, ids));

    return results;
  }
}
