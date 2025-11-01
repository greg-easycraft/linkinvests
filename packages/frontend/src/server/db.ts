import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { domainSchema } from "@linkinvests/db";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = new Pool({ connectionString: databaseUrl });

export type DomainDbType = NodePgDatabase<typeof domainSchema>;

export const db: DomainDbType = drizzle(client, { schema: domainSchema });
