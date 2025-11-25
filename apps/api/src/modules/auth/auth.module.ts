import { getAuthConfig } from '@app/modules/auth/config/auth';
import { SignUpHook } from '@app/modules/auth/hooks/sign-up.hook';
import { SignUpService } from '@app/modules/auth/serivces/sign-up.service';
import { DatabaseService } from '@app/modules/database/database.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [
    BetterAuthModule.forRootAsync({
      inject: [DatabaseService, ConfigService],
      useFactory: ({ db }: DatabaseService, configService: ConfigService) => ({
        auth: getAuthConfig(db, configService),
      }),
    }),
  ],
  providers: [SignUpHook, SignUpService],
})
export class AuthModule {}
