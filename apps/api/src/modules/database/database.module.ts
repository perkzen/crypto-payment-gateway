import {
  DATABASE_CONNECTION,
  getDatabaseConnection,
} from '@app/modules/database/utils/get-database-connection';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: getDatabaseConnection,
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
