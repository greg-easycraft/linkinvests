import { DynamicModule } from '@nestjs/common';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.number().default(8080),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REDIS_URL: z.string(),
  BASIC_AUTH_USERNAME: z.string(),
  BASIC_AUTH_PASSWORD: z.string(),
});

export const config = configSchema.parse(process.env);

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
