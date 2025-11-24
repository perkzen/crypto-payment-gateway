import { InjectConnectionPool } from '@app/modules/database/deocrators/inject-connection-pool';
import * as schemas from '@app/modules/database/schemas';
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService {
  public db: NodePgDatabase<typeof schemas>;

  constructor(@InjectConnectionPool() private readonly pool: Pool) {
    this.db = drizzle(this.pool, {
      logger: true,
      schema: schemas,
    });
  }
}
