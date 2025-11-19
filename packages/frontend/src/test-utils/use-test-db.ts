import { execSync } from 'child_process';

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';

import { type DomainDbType } from '~/types/db';
import { domainSchema } from '@linkinvests/db';

import {
	ALL_AUCTIONS,
	ALL_ENERGY_DIAGNOSTICS,
	ALL_LISTINGS,
	ALL_LIQUIDATIONS,
	ALL_SUCCESSIONS,
} from '@linkinvests/shared';

/* eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
require('dotenv').config();

const TEST_DB_URL = getDbUrl();

export function useTestDb(
	options: { autoInjectFixtures?: boolean } = { autoInjectFixtures: true }
): DomainDbType {
	if (!TEST_DB_URL) {
		throw new Error('TEST_DATABASE_URL is not set');
	}

	const client = new Pool({ connectionString: TEST_DB_URL });
	const db = drizzle(client, { schema: domainSchema });

	async function resetDb() {
		await db.delete(domainSchema.opportunityAuctions);
		await db.delete(domainSchema.opportunitySuccessions);
		await db.delete(domainSchema.opportunityLiquidations);
		await db.delete(domainSchema.energyDiagnostics);
		await db.delete(domainSchema.opportunityListings);
	}

	beforeAll(async () => {
		execSync(`DATABASE_URL=${TEST_DB_URL} npx drizzle-kit push --force`);
	});

	beforeEach(async () => {
		await resetDb();
		if (!options.autoInjectFixtures) return;
		await db.insert(domainSchema.opportunityAuctions).values(ALL_AUCTIONS);
		await db.insert(domainSchema.opportunitySuccessions).values(ALL_SUCCESSIONS);
		await db.insert(domainSchema.opportunityLiquidations).values(ALL_LIQUIDATIONS);
		await db.insert(domainSchema.energyDiagnostics).values(ALL_ENERGY_DIAGNOSTICS);
		await db.insert(domainSchema.opportunityListings).values(ALL_LISTINGS);
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
