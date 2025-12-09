import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

export function getBlockchainClient() {
  return createPublicClient({
    chain: hardhat,
    transport: http(),
  });
}
