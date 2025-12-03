import { execSync } from 'child_process';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@linkinvests/db';
import type { DomainDbType } from '~/types/db';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const TEST_DB_URL = getDbUrl();

export function useTestDb(): DomainDbType {
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

  beforeAll(async () => {
    execSync(`DATABASE_URL=${TEST_DB_URL} npx drizzle-kit push --force`);
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await client.end();
  });

  return db;
}

function getDbUrl(): string {
  return (
    process.env.TEST_DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/test'
  );
}
