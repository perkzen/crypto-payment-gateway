import { type HttpService } from '@nestjs/axios';
import { type Ticker, type Tickers } from '@workspace/shared';
import type { ExchangeStrategy } from './exchange.strategy';

export class BinanceExchangeStrategy implements ExchangeStrategy {
  constructor(private readonly httpService: HttpService) {}

  async getExchangeRate(tickers: Tickers) {
    const url = new URL('https://api.binance.com/api/v3/ticker/price');
    const symbol = this.mapTickerToSymbol(tickers);
    url.searchParams.set('symbol', symbol);

    const response = await this.httpService.axiosRef.get<{ price: string }>(
      url.toString(),
    );

    return parseFloat(response.data.price);
  }

  mapTickerToSymbol(tickers: Tickers) {
    const tickerMap: Record<Ticker, string> = {
      USD: 'USDT',
      EUR: 'EUR',
      ETH: 'ETH',
    };

    const cryptoTicker = tickerMap[tickers[0]];
    const fiatTicker = tickerMap[tickers[1]];

    if (!cryptoTicker || !fiatTicker) {
      throw new Error('Unsupported ticker');
    }

    return `${cryptoTicker}${fiatTicker}`;
  }
}
