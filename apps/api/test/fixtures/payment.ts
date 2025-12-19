import { faker } from '@faker-js/faker';
import type { CreatePayment } from '@workspace/shared';

/**
 * Creates a test fixture for CreatePayment with default values
 */
export function createPaymentFixture(
  overrides?: Partial<CreatePayment>,
): CreatePayment {
  return {
    network: 'ethereum',
    address: faker.finance.ethereumAddress(),
    txHash: `0x${faker.string.hexadecimal({ length: 64 })}`,
    paidAmount: faker.string.numeric({ length: 18 }),
    blockNumber: faker.string.numeric({ length: 10 }),
    ...overrides,
  };
}
