import { Inject } from '@nestjs/common';

export const BLOCKCHAIN_CLIENT = 'BLOCKCHAIN_CLIENT';

export function Blockchain(): PropertyDecorator & ParameterDecorator {
  return Inject(BLOCKCHAIN_CLIENT);
}
