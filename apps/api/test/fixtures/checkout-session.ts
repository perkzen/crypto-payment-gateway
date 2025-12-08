import { faker } from '@faker-js/faker';
import type {
  CreateCheckoutSession,
  CreateCheckoutSessionResult,
  PublicCheckoutSession,
} from '@workspace/shared';

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

/**
 * Creates a test fixture for CreateCheckoutSessionResult with default values
 */
export function createCheckoutSessionResultFixture(
  overrides?: Partial<CreateCheckoutSessionResult>,
): CreateCheckoutSessionResult {
  return {
    id: faker.string.uuid(),
    checkoutUrl: faker.internet.url(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    metadata: null,
    ...overrides,
  };
}

/**
 * Creates a test fixture for PublicCheckoutSession with default values
 */
export function createPublicCheckoutSessionFixture(
  overrides?: Partial<PublicCheckoutSession>,
): PublicCheckoutSession {
  return {
    id: faker.string.uuid(),
    amountFiat: 10000,
    fiatCurrency: 'USD',
    allowedCryptoCurrencies: ['ETH'],
    allowedNetworks: ['ethereum'],
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    merchantWalletAddress: faker.finance.ethereumAddress(),
    successUrl: faker.internet.url(),
    cancelUrl: faker.internet.url(),
    ...overrides,
  };
}
