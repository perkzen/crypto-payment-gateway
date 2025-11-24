import { ConfigurableModuleBuilder } from '@nestjs/common';

export type ConnectionStringOptions = {
  connectionString: string;
};

export type ConnectionParamsOptions = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type DatabaseOptions = ConnectionStringOptions | ConnectionParamsOptions;

export const CONNECTION_POOL = 'CONNECTION_POOL';

export const {
  ConfigurableModuleClass: ConfigurableDatabaseModule,
  MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS,
} = new ConfigurableModuleBuilder<DatabaseOptions>()
  .setClassMethodName('forRoot')
  .build();
