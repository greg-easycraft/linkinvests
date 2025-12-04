import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@linkinvests/db';
import type { DomainDbType } from '~/types/db';
import {
  ALL_ENERGY_DIAGNOSTICS,
  ALL_AUCTIONS,
  ALL_SUCCESSIONS,
  ALL_LIQUIDATIONS,
  ALL_LISTINGS,
} from './fixtures';
import { pushSchema } from '@linkinvests/db/push-schema';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const TEST_DB_URL = getDbUrl();

export function useTestDb(autoInjectFixtures: boolean = true): DomainDbType {
  if (!TEST_DB_URL) {
    throw new Error('TEST_DATABASE_URL is not set');
  }

  const client = postgres(TEST_DB_URL);
  const db = drizzle(client, { schema });

  async function resetDb() {
    await db.delete(schema.opportunityAuctions);
    await db.delete(schema.opportunitySuccessions);
    await db.delete(schema.opportunityLiquidations);
    await db.delete(schema.energyDiagnostics);
    await db.delete(schema.opportunityListings);
  }

  beforeAll(() => {
    pushSchema(TEST_DB_URL);
  });

  beforeEach(async () => {
    await resetDb();
    if (!autoInjectFixtures) return;
    await db.insert(schema.opportunityAuctions).values(ALL_AUCTIONS);
    await db.insert(schema.opportunitySuccessions).values(ALL_SUCCESSIONS);
    await db.insert(schema.opportunityLiquidations).values(ALL_LIQUIDATIONS);
    await db.insert(schema.energyDiagnostics).values(ALL_ENERGY_DIAGNOSTICS);
    await db.insert(schema.opportunityListings).values(ALL_LISTINGS);
  });

  afterAll(async () => {
    await client.end();
  });

  return db;
}

function getDbUrl(): string {
  return (
    process.env.TEST_DATABASE_URL ??
    'postgres://linkinvests:linkinvests@localhost:5432/test'
  );
}
