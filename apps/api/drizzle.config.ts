import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/database/schemas/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
