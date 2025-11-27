import { CONNECTION_POOL } from '@app/modules/database/database.module-definition';
import { Inject } from '@nestjs/common';

export function InjectConnectionPool(): PropertyDecorator & ParameterDecorator {
  return Inject(CONNECTION_POOL);
}
