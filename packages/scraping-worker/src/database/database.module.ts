import { DynamicModule, Logger, type OnModuleDestroy } from '@nestjs/common';
import { domainSchema } from '@linkinvests/db';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export type DomainDbType = NodePgDatabase<typeof domainSchema>;

export class DatabaseModule implements OnModuleDestroy {
  private static logger = new Logger(DatabaseModule.name);
  private static client?: Pool;

  static forRoot(connectionString: string): DynamicModule {
    const client = new Pool({ connectionString });
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
