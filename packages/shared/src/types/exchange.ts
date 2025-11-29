export type FiatTicker = 'USD' | 'EUR';
export type CryptoTicker = 'ETH';
export type Ticker = CryptoTicker | FiatTicker;
export type Tickers = [CryptoTicker, FiatTicker];

