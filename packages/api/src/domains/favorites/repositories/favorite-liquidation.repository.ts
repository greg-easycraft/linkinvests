import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { opportunityLiquidations } from '@linkinvests/db';
import type { Liquidation } from '@linkinvests/shared';

import { DATABASE_TOKEN } from '~/common/database';
import type { DomainDbType } from '~/types/db';

import { FavoriteLiquidationRepository } from '../lib.types';

@Injectable()
export class FavoriteLiquidationRepositoryImpl implements FavoriteLiquidationRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByIds(ids: Array<string>): Promise<Array<Liquidation>> {
    if (ids.length === 0) return [];

    const results = await this.db
      .select()
      .from(opportunityLiquidations)
      .where(inArray(opportunityLiquidations.id, ids));

    return results.map((r) => this.mapLiquidation(r));
  }

  private mapLiquidation(
    liquidation: typeof opportunityLiquidations.$inferSelect,
  ): Liquidation {
    return {
      ...liquidation,
      companyContact: liquidation.companyContact ?? undefined,
      externalId: liquidation.siret,
    };
  }
}
