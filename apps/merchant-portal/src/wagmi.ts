import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [hardhat],
  ssr: true,
});
