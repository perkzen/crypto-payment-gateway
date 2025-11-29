import { EXCHANGE } from '@app/modules/exchange/strategies/exchange.strategy';
import { Inject } from '@nestjs/common';

export function InjectExchange(): PropertyDecorator & ParameterDecorator {
  return Inject(EXCHANGE);
}
