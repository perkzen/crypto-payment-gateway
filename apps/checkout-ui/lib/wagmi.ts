import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'viem/chains';
import { http } from 'wagmi';

// Singleton pattern to prevent WalletConnect Core multiple initialization
const globalForWagmi = globalThis as unknown as {
  wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined;
};

export const config: ReturnType<typeof getDefaultConfig> =
  globalForWagmi.wagmiConfig ??
  (globalForWagmi.wagmiConfig = getDefaultConfig({
    appName: 'Crypto Payment Gateway - Checkout',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    chains: [hardhat],
    ssr: true,
    transports: {
      [hardhat.id]: http('http://localhost:8545'),
    },
  }));
