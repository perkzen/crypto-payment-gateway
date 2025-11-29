export const SUPPORTED_FIAT_TICKERS = ['USD', 'EUR'] as const;
export const SUPPORTED_CRYPTO_TICKERS = ['ETH'] as const;

export type FiatTicker = (typeof SUPPORTED_FIAT_TICKERS)[number];
export type CryptoTicker = (typeof SUPPORTED_CRYPTO_TICKERS)[number];
export type Ticker = CryptoTicker | FiatTicker;
export type Tickers = [CryptoTicker, FiatTicker];
