import { hardhat, mainnet } from 'viem/chains';
import type { Chain } from 'viem';

/**
 * Map network name to viem chain
 */
export function getChainFromNetworkName(networkName: string): Chain {
  switch (networkName.toLowerCase()) {
    case 'hardhat':
      return hardhat;
    case 'ethereum':
      return mainnet;
    default:
      throw new Error(`Unsupported network: ${networkName}`);
  }
}
