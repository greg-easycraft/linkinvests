import { DynamicModule, Logger, OnModuleDestroy } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { domainSchema } from '@linkinvests/db';
import postgres from 'postgres';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export type DomainDbType = PostgresJsDatabase<typeof domainSchema>;

export class DatabaseModule implements OnModuleDestroy {
  private static logger = new Logger(DatabaseModule.name);
  private static client?: postgres.Sql;

  static forRoot(): DynamicModule {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const client = postgres(databaseUrl, {
      max: 10,
    });
    DatabaseModule.client = client;

    const connection = drizzle(client, { schema: domainSchema });

    DatabaseModule.logger.log('Database connection established');

    return {
      module: DatabaseModule,
      global: true,
      providers: [
        {
          provide: DATABASE_CONNECTION,
          useValue: connection,
        },
      ],
      exports: [DATABASE_CONNECTION],
    };
  }

  onModuleDestroy() {
    void DatabaseModule.client?.end();
    DatabaseModule.logger.log('Database connection destroyed');
  }
}
