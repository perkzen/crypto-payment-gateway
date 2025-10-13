import { getAuthConfig } from '@app/modules/auth/config/auth';
import { DatabaseModule } from '@app/modules/database/database.module';
import { DATABASE_CONNECTION } from '@app/modules/database/utils/get-database-client';
import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DATABASE_CONNECTION],
      useFactory: getAuthConfig,
    }),
  ],
})
export class AuthModule {}
