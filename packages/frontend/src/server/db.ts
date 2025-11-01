import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { domainSchema } from "@linkinvests/db";
import { Pool } from "pg";
import { env } from "~/lib/env";

const client = new Pool({ connectionString: env.DATABASE_URL });

export type DomainDbType = NodePgDatabase<typeof domainSchema>;

export const db: DomainDbType = drizzle(client, { schema: domainSchema });
