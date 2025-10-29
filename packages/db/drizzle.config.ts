import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'linkinvests',
    password: process.env.DB_PASSWORD || 'linkinvests',
    database: process.env.DB_NAME || 'linkinvests',
    ssl: process.env.NODE_ENV === 'production' ? true : false,
  },
});
