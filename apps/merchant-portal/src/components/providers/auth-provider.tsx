import { type PropsWithChildren } from 'react';
import { RainbowKitAuthenticationProvider } from '@rainbow-me/rainbowkit';
import { useRainbowKitAuthAdapter } from '@/hooks/use-rainbow-kit-auth-adapter';
import { useRainbowKitAuthStatus } from '@/hooks/use-rainbow-kit-auth-status';

export function AuthProvider({ children }: PropsWithChildren) {
  const authAdapter = useRainbowKitAuthAdapter();
  const authStatus = useRainbowKitAuthStatus();

  return (
    <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
      {children}
    </RainbowKitAuthenticationProvider>
  );
}
