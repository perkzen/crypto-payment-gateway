import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'viem/chains';

// Singleton pattern to prevent WalletConnect Core multiple initialization

const globalForWagmi = globalThis as unknown as {
  wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined;
};

export const config =
  globalForWagmi.wagmiConfig ??
  (globalForWagmi.wagmiConfig = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
    chains: [hardhat],
    ssr: true,
  }));
