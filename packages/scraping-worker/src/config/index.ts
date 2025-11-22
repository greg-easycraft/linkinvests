import { DynamicModule } from '@nestjs/common';
import { z } from 'zod';
import { config as envConfig } from 'dotenv';
envConfig();

const configSchema = z.object({
  PORT: z.number().default(8081),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  BASIC_AUTH_USERNAME: z.string(),
  BASIC_AUTH_PASSWORD: z.string(),
  // S3 Configuration
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT_URL: z.string().optional(),
  // Gemini AI Configuration
  GEMINI_API_KEY: z.string(),
  GENKIT_ENV: z.enum(['dev', 'prod']).default('dev'),
});

export const config = configSchema.parse({
  ...process.env,
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 8081,
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
