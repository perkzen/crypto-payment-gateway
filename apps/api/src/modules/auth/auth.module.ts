import { getAuthConfig } from '@app/modules/auth/config/auth';
import { DatabaseModule } from '@app/modules/database/database.module';
import { DATABASE_CONNECTION } from '@app/modules/database/utils/get-database-connection';
import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DATABASE_CONNECTION],
      useFactory: (database: NodePgDatabase) => ({
        auth: getAuthConfig(database),
      }),
    }),
  ],
})
export class AuthModule {}
