import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const getAuthConfig = (database: NodePgDatabase) => ({
  auth: betterAuth({
    database: drizzleAdapter(database, { provider: 'pg' }),
  }),
});
