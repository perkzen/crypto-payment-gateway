import { ZERO_ADDRESS } from '../constants/addresses.constants';

/**
 * Extract token address from event (undefined for native payments)
 * @param tokenAddress - The token address from the blockchain event
 * @returns The token address if it's not the zero address, undefined for native payments
 */
export function extractTokenAddress(
  tokenAddress: string,
): string | undefined {
  return tokenAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()
    ? undefined
    : tokenAddress;
}
