import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schemas from '../schemas';
import type { ConfigService } from '@nestjs/config';

export type Database = NodePgDatabase<typeof schemas>;

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

export const getDatabaseConnection = async (configService: ConfigService) => {
  const dbUrl = configService.getOrThrow('DATABASE_URL');

  const pool = new Pool({
    connectionString: dbUrl,
  });

  return drizzle(pool, {
    logger: true,
    schema: schemas,
  });
};
