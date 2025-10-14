import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Configuration function for runtime use
export const getAuthConfig = (database: NodePgDatabase) =>
  betterAuth({
    plugins: [
      openAPI(),
      //apiKey({})
    ],

    database: drizzleAdapter(database, { provider: 'pg' }),
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
export const auth = getAuthConfig({} as NodePgDatabase);
