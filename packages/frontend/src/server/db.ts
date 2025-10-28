import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { domainSchema } from "@linkinvest/db";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(databaseUrl, {
  max: 10,
});

export type DomainDbType = PostgresJsDatabase<typeof domainSchema>;

export const db: DomainDbType = drizzle(client, { schema: domainSchema });
