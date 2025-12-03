import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@linkinvests/db';

export type DomainDbType = PostgresJsDatabase<typeof schema>;
