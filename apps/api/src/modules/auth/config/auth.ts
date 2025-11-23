import { authPlugins } from '@app/modules/auth/config/auth.plugins';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '@app/modules/database/utils/get-database-connection';

export const getAuthConfig = (database: Database) =>
  betterAuth({
    trustedOrigins: ['http://localhost:3000'],
    plugins: authPlugins,
    database: drizzleAdapter(database, { provider: 'pg' }),
    hooks: {},
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
export const auth = getAuthConfig({} as Database);
