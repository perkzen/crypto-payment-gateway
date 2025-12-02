import type { CryptoTicker, FiatTicker } from '../types/exchange';

/**
 * Get the symbol for a cryptocurrency
 */
export function getCryptoCurrencySymbol(crypto: CryptoTicker | string): string {
  const symbols: Record<string, string> = {
    ETH: 'Ξ',
    BTC: '₿',
    USDT: '₮',
    USDC: '$',
  };
  return symbols[crypto] || crypto;
}

/**
 * Format fiat amount for display
 * @param amount - Amount in cents
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Formatted amount string
 */
export function formatFiatAmount(
  amount: number,
  currency: string,
): string {
  // Convert from cents to dollars/euros
  return `${(amount / 100).toFixed(2)} ${currency}`;
}

/**
 * Format crypto amount for display
 * @param amount - Amount in base units (e.g., ETH, not Wei)
 * @param currency - Currency code (e.g., 'ETH', 'BTC')
 * @returns Formatted amount string
 */
export function formatCryptoAmount(
  amount: number,
  currency: string,
): string {
  // For crypto, show more decimal places
  return `${amount.toFixed(6)} ${currency}`;
}

/**
 * Get fiat currency symbol
 */
export function getFiatCurrencySymbol(currency: FiatTicker | string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  return symbols[currency] || currency;
}

