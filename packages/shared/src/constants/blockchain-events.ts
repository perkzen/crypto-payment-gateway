/**
 * Blockchain event name constants
 *
 * These constants represent the different smart contract event names
 * that can be watched on the blockchain.
 */
export const BlockchainEventName = {
  Paid: 'Paid',
} as const;

/**
 * Type representing all possible blockchain event names
 */
export type BlockchainEventName =
  (typeof BlockchainEventName)[keyof typeof BlockchainEventName];

