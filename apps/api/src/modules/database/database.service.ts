import { isTestEnv } from '@app/config/env/env-checks';
import { InjectConnectionPool } from '@app/modules/database/deocrators/inject-connection-pool';
import * as schemas from '@app/modules/database/schemas';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  public db: NodePgDatabase<typeof schemas>;

  constructor(@InjectConnectionPool() private readonly pool: Pool) {
    this.db = drizzle(this.pool, {
      logger: !isTestEnv(),
      schema: schemas,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
