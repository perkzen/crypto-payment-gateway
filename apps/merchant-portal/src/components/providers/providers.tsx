'use client';

import { type ReactNode } from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster as ToastProvider } from '@workspace/ui/components/sonner';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { WagmiProvider } from 'wagmi';
import { AuthProvider } from '@/components/providers/auth-provider';
import { getQueryClient } from '@/lib/query-client';
import { config } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          enableColorScheme
        >
          <AuthProvider>
            <RainbowKitProvider>{children}</RainbowKitProvider>
            <ToastProvider />
          </AuthProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
