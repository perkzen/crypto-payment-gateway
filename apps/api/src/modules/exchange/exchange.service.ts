import { InjectExchange } from '@app/modules/exchange/decorators/injcet-exchange-strategy';
import {
  type ExchangeRateResult,
  type ExchangeStrategy,
} from '@app/modules/exchange/strategies/exchange.strategy';
import { Injectable } from '@nestjs/common';
import { type Tickers } from '@workspace/shared';

@Injectable()
export class ExchangeService {
  constructor(@InjectExchange() private readonly exchange: ExchangeStrategy) {}

  async getExchangeRate(tickers: Tickers): Promise<ExchangeRateResult> {
    return this.exchange.getExchangeRate(tickers);
  }
}
