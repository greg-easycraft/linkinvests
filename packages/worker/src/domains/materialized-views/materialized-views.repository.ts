import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATABASE_CONNECTION, type DomainDbType } from '~/database';
import { sql } from 'drizzle-orm';

@Injectable()
export class MaterializedViewsRepository {
  private readonly logger = new Logger(MaterializedViewsRepository.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: DomainDbType
  ) {}

  async refreshAllOpportunities(): Promise<void> {
    this.logger.log('Refreshing all_opportunities materialized view...');
    const startTime = Date.now();

    await this.db.execute(sql`REFRESH MATERIALIZED VIEW all_opportunities`);

    const duration = Date.now() - startTime;
    this.logger.log(`Materialized view refreshed in ${duration}ms`);
  }
}
