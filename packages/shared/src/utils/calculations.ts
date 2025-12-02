/**
 * Calculate crypto amount from fiat amount using exchange rate
 * @param fiatAmountCents - Fiat amount in cents
 * @param exchangeRate - Exchange rate (fiat per crypto unit)
 * @returns Crypto amount
 * @throws Error if exchange rate is zero
 */
export function calculateCryptoAmount(
  fiatAmountCents: number,
  exchangeRate: number,
): number {
  if (exchangeRate === 0) {
    throw new Error('Exchange rate cannot be zero');
  }
  const fiatAmount = fiatAmountCents / 100;
  return fiatAmount / exchangeRate;
}

