/**
 * Ethereum address constants
 */

/**
 * Zero address (address(0)) - represents native payments in smart contracts
 * Format: 0x followed by 40 zeros (20 bytes = 40 hex characters)
 */
export const ZERO_ADDRESS = `0x${'0'.repeat(40)}` as const;
