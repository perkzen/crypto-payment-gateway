import { faker } from '@faker-js/faker';
import { type PublicClient } from 'viem';
import { type Address } from 'viem';

/**
 * Mock implementation of viem's PublicClient for testing.
 * Provides default implementations for methods used by BlockchainService.
 */
export class BlockchainClientMock implements Partial<PublicClient> {
  private blockNumber: bigint = 0n;
  private contractCode: `0x${string}` | null =
    faker.finance.ethereumAddress() as `0x${string}`;
  private unwatchCallbacks: Array<() => void> = [];

  /**
   * Set the block number that will be returned by getBlockNumber()
   */
  setBlockNumber(blockNumber: bigint): void {
    this.blockNumber = blockNumber;
  }

  /**
   * Set the contract code that will be returned by getCode()
   * Set to null or '0x' to simulate a non-existent contract
   */
  setContractCode(code: `0x${string}` | null): void {
    this.contractCode = code;
  }

  /**
   * Get all registered unwatch callbacks
   */
  getUnwatchCallbacks(): Array<() => void> {
    return this.unwatchCallbacks;
  }

  /**
   * Clear all registered unwatch callbacks
   */
  clearUnwatchCallbacks(): void {
    this.unwatchCallbacks = [];
  }

  /**
   * Call all registered unwatch callbacks and clear them
   * Useful for cleanup in tests
   */
  cleanup(): void {
    const callbacks = this.unwatchCallbacks.slice();
    this.unwatchCallbacks = [];
    callbacks.forEach((unwatch) => unwatch());
  }

  /**
   * Mock implementation of getBlockNumber()
   */
  async getBlockNumber(): Promise<bigint> {
    return this.blockNumber;
  }

  /**
   * Mock implementation of getCode()
   */
  async getCode(_params: { address: Address }): Promise<`0x${string}`> {
    // Return '0x' if contract code is null to match viem's behavior
    return (this.contractCode ?? '0x') as `0x${string}`;
  }

  /**
   * Mock implementation of watchContractEvent()
   * Returns a function that can be called to "unwatch" the event
   * Uses 'any' for parameters to avoid complex generic type issues
   */
  watchContractEvent(_params: any): () => void {
    const unwatch = () => {
      const index = this.unwatchCallbacks.indexOf(unwatch);
      if (index > -1) {
        this.unwatchCallbacks.splice(index, 1);
      }
    };

    this.unwatchCallbacks.push(unwatch);
    return unwatch;
  }
}
