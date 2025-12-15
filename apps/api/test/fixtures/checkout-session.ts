import { faker } from '@faker-js/faker';
import type { CreateCheckoutSession } from '@workspace/shared';

/**
 * Creates a test fixture for CreateCheckoutSession with default values
 */
export function createCheckoutSessionFixture(
  overrides?: Partial<CreateCheckoutSession>,
): CreateCheckoutSession {
  return {
    amountFiat: 10000,
    fiatCurrency: 'USD',
    allowedCryptoCurrencies: ['ETH'],
    allowedNetworks: ['ethereum'],
    successUrl: faker.internet.url(),
    cancelUrl: faker.internet.url(),
    ...overrides,
  };
}
