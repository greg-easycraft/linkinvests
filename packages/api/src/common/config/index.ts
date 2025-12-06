import { Global, Module } from '@nestjs/common';
import { z } from 'zod';
import { config as envConfig } from 'dotenv';
envConfig();

const configSchema = z.object({
  PORT: z.number().default(8080),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.string(),
  RESEND_API_KEY: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  FRONTEND_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export const config = configSchema.parse({
  ...process.env,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8080,
});

export const CONFIG_TOKEN = Symbol('CONFIG');

export type ConfigType = z.infer<typeof configSchema>;

@Global()
@Module({
  providers: [{ provide: CONFIG_TOKEN, useValue: config }],
  exports: [CONFIG_TOKEN],
})
export class ConfigModule {}
