import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from './get-database-client';

export function InjectDatabaseClient(): PropertyDecorator & ParameterDecorator {
  return Inject(DATABASE_CONNECTION);
}
