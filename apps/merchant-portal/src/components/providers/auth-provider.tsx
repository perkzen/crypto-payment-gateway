import { PropsWithChildren } from 'react';
import { RainbowKitAuthenticationProvider } from '@rainbow-me/rainbowkit';
import { useRainbowKitAuthStatus } from '@/hooks/use-rainbow-kit-auth-status';
import { useRainbowKitAuthAdapter } from '@/hooks/use-rainbow-kit-auth-adapter';

export function AuthProvider({ children }: PropsWithChildren) {
  const authAdapter = useRainbowKitAuthAdapter();
  const authStatus = useRainbowKitAuthStatus();

  return (
    <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
      {children}
    </RainbowKitAuthenticationProvider>
  );
}
