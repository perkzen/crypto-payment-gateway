import {
  type ExchangeRateResult,
  type ExchangeStrategy,
} from '@app/modules/exchange/strategies/exchange.strategy';
import { type Tickers } from '@workspace/shared';

export class ExchangeStrategyMock implements ExchangeStrategy {
  getExchangeRate(_tickers: Tickers): Promise<ExchangeRateResult> {
    return Promise.resolve({
      rate: 1000,
      timestamp: new Date(),
    });
  }
}
