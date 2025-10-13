import {
  DATABASE_CONNECTION,
  getDatabaseClient,
} from '@app/modules/database/utls/get-database-client';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: getDatabaseClient,
    },
  ],
})
export class DatabaseModule {}
