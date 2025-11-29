import { type Tickers } from '@workspace/shared';

export const EXCHANGE = 'EXCHANGE';

export interface ExchangeStrategy {
  /**
   * Get exchange rate between two tickers
   * * for example tickers = ['ETH', 'USD'], will return how much USD is needed to buy 1 ETH
   *
   * @param tickers
   */
  getExchangeRate(tickers: Tickers): Promise<number>;
}
