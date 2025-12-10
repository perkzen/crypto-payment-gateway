/**
 * Supported blockchain networks
 */
export const SUPPORTED_NETWORKS = ['hardhat', 'ethereum'] as const;

/**
 * Type representing all supported blockchain networks
 */
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

