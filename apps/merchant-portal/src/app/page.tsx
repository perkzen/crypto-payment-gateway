'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Page() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Merchant Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect your wallet to get started
          </p>
        </div>
        <ConnectButton />
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by RainbowKit & WalletConnect
        </div>
      </div>
    </div>
  );
}
