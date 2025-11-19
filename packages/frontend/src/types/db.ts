import { domainSchema } from "@linkinvests/db";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export type DomainDbType = NodePgDatabase<typeof domainSchema>;