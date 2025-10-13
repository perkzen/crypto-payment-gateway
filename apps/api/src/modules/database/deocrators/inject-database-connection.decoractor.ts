import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../utils/get-database-connection';

export function InjectDatabaseConnection(): PropertyDecorator &
  ParameterDecorator {
  return Inject(DATABASE_CONNECTION);
}
