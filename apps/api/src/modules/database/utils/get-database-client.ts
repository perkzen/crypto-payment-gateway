import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { ConfigService } from '@nestjs/config';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

export const getDatabaseClient = async (configService: ConfigService) => {
  const dbUrl = configService.getOrThrow('DATABASE_URL');

  const pool = new Pool({
    connectionString: dbUrl,
  });

  return drizzle(pool, {
    logger: true,
    schema: {},
  });
};
