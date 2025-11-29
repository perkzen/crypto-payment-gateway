import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { type Ticker, type Tickers } from '@workspace/shared';
import type { ExchangeStrategy } from './exchange.strategy';

@Injectable()
export class BinanceExchangeStrategy implements ExchangeStrategy {
  private readonly logger = new Logger(BinanceExchangeStrategy.name);

  constructor(private readonly httpService: HttpService) {}

  async getExchangeRate(tickers: Tickers) {
    const url = new URL('https://api.binance.com/api/v3/ticker/price');
    const symbol = this.mapTickerToSymbol(tickers);
    url.searchParams.set('symbol', symbol);

    try {
      const response = await this.httpService.axiosRef.get<{ price: string }>(
        url.toString(),
      );

      return parseFloat(response.data.price);
    } catch (error) {
      this.logger.error(
        `Error fetching exchange rate from Binance for symbol ${symbol}: ${error}`,
      );
      throw new Error('Failed to fetch exchange rate from Binance');
    }
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
