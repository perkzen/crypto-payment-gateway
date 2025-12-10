import { type ConfigService } from '@nestjs/config';
import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

export function getBlockchainClient(configService: ConfigService) {
  const rpcUrl = configService.getOrThrow('BLOCKCHAIN_RPC_URL');
  return createPublicClient({
    chain: hardhat,
    transport: http(rpcUrl),
  });
}
