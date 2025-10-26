import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { domainSchema } from '@repo/db';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

const databaseProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    return drizzle(pool, { schema: domainSchema });
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
