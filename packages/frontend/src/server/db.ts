import { drizzle } from "drizzle-orm/node-postgres";
import { domainSchema } from "@linkinvests/db";
import { type DomainDbType } from "~/types/db";
import { Pool } from "pg";
import { env } from "~/lib/env";

const client = new Pool({ connectionString: env.DATABASE_URL });


export const db: DomainDbType = drizzle(client, { schema: domainSchema });
