import { type ExchangeStrategy } from '@app/modules/exchange/strategies/exchange.strategy';
import { type Tickers } from '@workspace/shared';

export class ExchangeStrategyMock implements ExchangeStrategy {
  getExchangeRate(_tickers: Tickers): Promise<number> {
    return Promise.resolve(1000);
  }
}
