import {
  DATABASE_CONNECTION,
  getDatabaseClient,
} from '@app/modules/database/utils/get-database-client';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: getDatabaseClient,
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
