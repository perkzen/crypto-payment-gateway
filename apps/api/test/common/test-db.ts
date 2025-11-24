import { randomUUID } from 'crypto';
import { join } from 'path';
import { type DatabaseOptions } from '@app/modules/database/database.module-definition';
import { Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export class TestDB {
  private testDatabaseName: string | null = null;
  private readonly logger = new Logger(TestDB.name);

  constructor() {}

  getDatabaseOptions(): DatabaseOptions {
    return {
      database: this.testDatabaseName,
      host: 'localhost',
      port: 5433,
      user: 'admin',
      password: 'admin',
    };
  }

  private getAdminDatabaseOptions(): DatabaseOptions {
    return {
      ...this.getDatabaseOptions(),
      database: 'postgres',
    };
  }

  /**
   * Create a new test database and run migrations
   * Returns the database name and URL for the new test database
   */
  async createTestDatabase() {
    this.testDatabaseName = `test_${randomUUID().replace(/-/g, '_')}`;

    const adminPool = new Pool(this.getAdminDatabaseOptions());

    try {
      await adminPool.query(`CREATE DATABASE "${this.testDatabaseName}"`);
      await this.runMigrations();
    } finally {
      await adminPool.end();
    }
  }

  /**
   * Drop the test database
   */
  async dropTestDatabase(): Promise<void> {
    if (!this.testDatabaseName) return;

    await this.dropTestDatabaseByName(this.testDatabaseName);
    this.testDatabaseName = null;
  }

  /**
   * Drop a test database by name
   */
  async dropTestDatabaseByName(databaseName: string): Promise<void> {
    const adminPool = new Pool(this.getAdminDatabaseOptions());

    try {
      // Terminate all connections to the test database
      await adminPool.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `,
        [databaseName],
      );

      // Drop the database
      await adminPool.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } catch (error) {
      // Ignore errors when dropping database (it might already be dropped)
      this.logger.error(
        `Error dropping test database "${databaseName}": ${
          (error as Error).message
        }`,
      );
    } finally {
      await adminPool.end();
    }
  }

  private async runMigrations() {
    const pool = new Pool(this.getAdminDatabaseOptions());
    const db = drizzle(pool);

    const migrationsFolder = join(__dirname, '../../drizzle');

    try {
      await migrate(db, { migrationsFolder });
    } catch (error) {
      this.logger.error(
        `Error running migrations on test database "${this.testDatabaseName}": ${
          (error as Error).message
        }`,
      );
      throw error;
    } finally {
      await pool.end();
    }
  }
}
