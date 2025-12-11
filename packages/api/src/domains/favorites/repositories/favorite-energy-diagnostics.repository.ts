import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { energyDiagnostics } from '@linkinvests/db';
import type { EnergyDiagnostic } from '@linkinvests/shared';

import { DATABASE_TOKEN } from '~/common/database';
import type { DomainDbType } from '~/types/db';

import { FavoriteEnergyDiagnosticsRepository } from '../lib.types';

@Injectable()
export class FavoriteEnergyDiagnosticsRepositoryImpl implements FavoriteEnergyDiagnosticsRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: DomainDbType) {}

  async findByIds(ids: Array<string>): Promise<Array<EnergyDiagnostic>> {
    if (ids.length === 0) return [];

    const results = await this.db
      .select()
      .from(energyDiagnostics)
      .where(inArray(energyDiagnostics.id, ids));

    // Type assertion needed due to energyClass/gazClass string vs enum mismatch
    // This is a pre-existing issue in the codebase
    return results as unknown as Array<EnergyDiagnostic>;
  }
}
