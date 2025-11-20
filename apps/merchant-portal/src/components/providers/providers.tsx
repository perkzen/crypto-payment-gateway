'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster as ToastProvider } from '@workspace/ui/components/sonner';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
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
