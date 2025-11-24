import { getAuthConfig } from '@app/modules/auth/config/auth';
import { SignUpHook } from '@app/modules/auth/hooks/sign-up.hook';
import { SignUpService } from '@app/modules/auth/serivces/sign-up.service';
import { DatabaseService } from '@app/modules/database/database.service';
import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      inject: [DatabaseService],
      useFactory: (databaseService: DatabaseService) => ({
        auth: getAuthConfig(databaseService.db),
      }),
    }),
  ],
  providers: [SignUpHook, SignUpService],
})
export class AuthModule {}
