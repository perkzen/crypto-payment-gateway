/**
 * Get the symbol for a cryptocurrency
 */
export function getCryptoCurrencySymbol(crypto: string): string {
  const symbols: Record<string, string> = {
    ETH: 'Ξ',
    BTC: '₿',
    USDT: '₮',
    USDC: '$',
  };
  return symbols[crypto] || crypto;
}

/**
 * Format amount for display
 * @param amount - Amount in cents (for fiat) or base units (for crypto)
 * @param currency - Currency code (e.g., 'USD', 'ETH')
 * @param isCrypto - Whether this is a cryptocurrency amount
 * @returns Formatted amount string
 */
export function formatAmount(
  amount: number,
  currency: string,
  isCrypto = false,
): string {
  if (isCrypto) {
    // For crypto, show more decimal places
    return `${amount.toFixed(6)} ${currency}`;
  }
  // For fiat, convert from cents to dollars/euros
  return `${(amount / 100).toFixed(2)} ${currency}`;
}

/**
 * Get fiat currency symbol
 */
export function getFiatCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  return symbols[currency] || currency;
}

/**
 * Calculate crypto amount from fiat amount using exchange rate
 * @param fiatAmountCents - Fiat amount in cents
 * @param exchangeRate - Exchange rate (fiat per crypto unit)
 * @returns Crypto amount
 */
export function calculateCryptoAmount(
  fiatAmountCents: number,
  exchangeRate: number,
): number {
  const fiatAmount = fiatAmountCents / 100;
  return fiatAmount / exchangeRate;
}

