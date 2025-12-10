import type { SupportedNetwork } from '@workspace/shared';

/**
 * Network-specific minimum confirmation requirements
 * These values are based on industry standards for blockchain security
 */
export const NETWORK_MIN_CONFIRMATIONS: Record<SupportedNetwork, number> = {
  ethereum: 12,
  hardhat: 1,
};

/**
 * Get the minimum number of confirmations required for a given network
 * @param network The blockchain network identifier
 * @returns The minimum number of confirmations (defaults to 12 for unknown networks)
 */
export function getMinConfirmationsForNetwork(network: string): number {
  const normalizedNetwork = network.toLowerCase() as SupportedNetwork;
  return NETWORK_MIN_CONFIRMATIONS[normalizedNetwork] ?? 12;
}

