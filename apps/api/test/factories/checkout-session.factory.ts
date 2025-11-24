import type { CreateCheckoutSession } from '@workspace/schemas';

/**
 * Factory for creating test checkout session payloads
 */
export class CheckoutSessionFactory {
  /**
   * Create a valid checkout session payload
   */
  static validCheckoutSessionPayload(
    overrides?: Partial<CreateCheckoutSession>,
  ): CreateCheckoutSession {
    return {
      amountFiat: 10000, // $100.00 in cents
      fiatCurrency: 'USD',
      allowedCryptoCurrencies: ['ETH', 'BTC'],
      allowedNetworks: ['ethereum', 'bitcoin'],
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      expiresInMinutes: 60,
      ...overrides,
    };
  }

  /**
   * Create valid payload with optional fields
   */
  static validCheckoutSessionWithOptionals(): CreateCheckoutSession {
    return {
      ...this.validCheckoutSessionPayload(),
      customerEmail: 'customer@example.com',
      metadata: {
        orderId: '12345',
        customField: 'test-value',
      },
      expiresInMinutes: 120,
    };
  }

  /**
   * Create valid payload with minimal fields
   */
  static minimalValidPayload(): CreateCheckoutSession {
    return {
      amountFiat: 1000,
      fiatCurrency: 'USD',
      allowedCryptoCurrencies: ['ETH'],
      allowedNetworks: ['ethereum'],
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };
  }

  /**
   * Get various invalid payloads for validation testing
   */
  static invalidCheckoutSessionPayloads() {
    const validBase = this.validCheckoutSessionPayload();

    return {
      negativeAmount: {
        ...validBase,
        amountFiat: -100,
      },
      zeroAmount: {
        ...validBase,
        amountFiat: 0,
      },
      invalidCurrencyTooShort: {
        ...validBase,
        fiatCurrency: 'US',
      },
      invalidCurrencyTooLong: {
        ...validBase,
        fiatCurrency: 'USDD',
      },
      emptyCryptoCurrencies: {
        ...validBase,
        allowedCryptoCurrencies: [],
      },
      emptyNetworks: {
        ...validBase,
        allowedNetworks: [],
      },
      invalidSuccessUrl: {
        ...validBase,
        successUrl: 'not-a-valid-url',
      },
      invalidCancelUrl: {
        ...validBase,
        cancelUrl: 'also-not-valid',
      },
      invalidEmail: {
        ...validBase,
        customerEmail: 'not-an-email',
      },
      expiresInMinutesTooSmall: {
        ...validBase,
        expiresInMinutes: 0,
      },
      expiresInMinutesTooLarge: {
        ...validBase,
        expiresInMinutes: 1441, // Max is 1440
      },
      missingAmountFiat: {
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      missingFiatCurrency: {
        amountFiat: 1000,
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      missingAllowedCryptoCurrencies: {
        amountFiat: 1000,
        fiatCurrency: 'USD',
        allowedNetworks: ['ethereum'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      missingAllowedNetworks: {
        amountFiat: 1000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
      missingSuccessUrl: {
        amountFiat: 1000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        cancelUrl: 'https://example.com/cancel',
      },
      missingCancelUrl: {
        amountFiat: 1000,
        fiatCurrency: 'USD',
        allowedCryptoCurrencies: ['ETH'],
        allowedNetworks: ['ethereum'],
        successUrl: 'https://example.com/success',
      },
    };
  }
}


