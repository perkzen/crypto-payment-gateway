import { getAuthPlugins } from '@app/modules/auth/config/auth.plugins';
import { type ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type * as schemas from '@app/modules/database/schemas';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type Database = NodePgDatabase<typeof schemas>;

export const getAuthConfig = (
  database: Database,
  configService: ConfigService,
) =>
  betterAuth({
    trustedOrigins: ['http://localhost:3000'],
    plugins: getAuthPlugins(configService),
    database: drizzleAdapter(database, { provider: 'pg' }),
    hooks: {},
  });

// Default auth instance for CLI usage (with dummy database)
// The CLI needs this to be exported as 'auth'
const mockConfigService = {
  getOrThrow: (_key: string) => {},
} as ConfigService;

export const auth = getAuthConfig({} as Database, mockConfigService);
