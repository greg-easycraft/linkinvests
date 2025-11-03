import { DynamicModule } from '@nestjs/common';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.number().default(8082),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REDIS_URL: z.string(),
  BASIC_AUTH_USERNAME: z.string(),
  BASIC_AUTH_PASSWORD: z.string(),
});

export const config = configSchema.parse({
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8082,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  REDIS_URL: process.env.REDIS_URL,
  BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
  BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
});

export const CONFIG_TOKEN = Symbol('CONFIG');

export type ConfigType = z.infer<typeof configSchema>;

export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      providers: [{ provide: CONFIG_TOKEN, useValue: config }],
      exports: [CONFIG_TOKEN],
    };
  }
}
