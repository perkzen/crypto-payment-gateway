import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'viem/chains';

// Singleton pattern to prevent WalletConnect Core multiple initialization
const globalForWagmi = globalThis as unknown as {
  wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined;
};

export const config =
  globalForWagmi.wagmiConfig ??
  (globalForWagmi.wagmiConfig = getDefaultConfig({
    appName: 'Crypto Payment Gateway - Checkout',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    chains: [mainnet, sepolia],
    ssr: true,
  }));

