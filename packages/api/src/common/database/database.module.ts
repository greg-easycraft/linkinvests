import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@linkinvests/db';
import { DATABASE_TOKEN } from './database.tokens';
import { CONFIG_TOKEN, type ConfigType } from '../config/index';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: (config: ConfigType) => {
        const client = postgres(config.DATABASE_URL);
        return drizzle(client, { schema });
      },
      inject: [CONFIG_TOKEN],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
