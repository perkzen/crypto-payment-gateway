import {
  CONNECTION_POOL,
  ConfigurableDatabaseModule,
  DATABASE_OPTIONS,
  DatabaseOptions,
} from '@app/modules/database/database.module-definition';
import { DatabaseService } from '@app/modules/database/database.service';
import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: CONNECTION_POOL,
      inject: [DATABASE_OPTIONS],
      useFactory: (options: DatabaseOptions) => {
        return new Pool(options);
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
