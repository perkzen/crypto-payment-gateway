'use client';

import { type ReactNode } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { WagmiProvider } from 'wagmi';
import { getQueryClient } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

