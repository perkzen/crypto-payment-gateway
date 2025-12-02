import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'viem/chains';

// Singleton pattern to prevent WalletConnect Core multiple initialization

const globalForWagmi = globalThis as unknown as {
  wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined;
};

function getWalletConnectProjectId(): string {
  const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

  if (!projectId || projectId.trim() === '') {
    throw new Error(
      'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required but not set. ' +
        'Please set this environment variable in your .env.local file. ' +
        'You can get a project ID from https://cloud.walletconnect.com/',
    );
  }

  return projectId.trim();
}

export const config =
  globalForWagmi.wagmiConfig ??
  (globalForWagmi.wagmiConfig = getDefaultConfig({
    appName: 'Crypto Payment Gateway - Merchant Portal',
    projectId: getWalletConnectProjectId(),
    chains: [hardhat],
    ssr: true,
  }));
