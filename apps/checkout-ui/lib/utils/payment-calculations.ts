import { formatFiatAmount } from '@workspace/shared';
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
  const cryptoAmount = rate > 0 ? fiatAmountInCents / 100 / rate : 0;

  return {
    exchangeRate,
    rate,
    fiatAmount,
    cryptoAmount,
  };
}
