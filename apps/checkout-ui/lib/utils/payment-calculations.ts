import {
  calculateCryptoAmount,
  formatFiatAmount,
} from '@workspace/shared';
import type { ExchangeRate } from '@workspace/shared';

interface PaymentAmountsParams {
  exchangeRateData: ExchangeRate | undefined;
  fiatAmountInCents: number;
  fiatCurrency: string;
}

interface PaymentAmounts {
  exchangeRate: ExchangeRate | null;
  rate: number;
  fiatAmount: string;
  cryptoAmount: number;
}

/**
 * Calculate payment amounts from exchange rate data and fiat amount
 * @param exchangeRateData - Exchange rate data from API (may be undefined)
 * @param fiatAmountInCents - Fiat amount in cents
 * @param fiatCurrency - Fiat currency code (e.g., 'USD', 'EUR')
 * @returns Object containing exchangeRate, rate, formatted fiatAmount, and cryptoAmount
 */
export function calculatePaymentAmounts({
  exchangeRateData,
  fiatAmountInCents,
  fiatCurrency,
}: PaymentAmountsParams): PaymentAmounts {
  const exchangeRate = exchangeRateData ?? null;
  const rate = exchangeRate?.rate ?? 0;
  const fiatAmount = formatFiatAmount(fiatAmountInCents, fiatCurrency);
  // Checkout UI intentionally returns 0 for zero/invalid rates instead of throwing,
  // to gracefully handle cases where exchange rate data is unavailable
  let cryptoAmount = 0;
  try {
    cryptoAmount = calculateCryptoAmount(fiatAmountInCents, rate);
  } catch {
    // Return 0 when rate is zero or invalid (shared function throws error)
    cryptoAmount = 0;
  }

  return {
    exchangeRate,
    rate,
    fiatAmount,
    cryptoAmount,
  };
}
