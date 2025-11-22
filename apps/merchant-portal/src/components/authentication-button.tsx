'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';

const ETHEREUM_ICON_URL =
  'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040';

export function AuthenticationButton() {
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect to dashboard after successful authentication
  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const isAuthenticating = !!session?.user;

        return (
          <Button
            onClick={openConnectModal}
            disabled={!ready}
            loading={isAuthenticating}
            loadingText="Authenticating..."
            size="lg"
          >
            <Image
              src={ETHEREUM_ICON_URL}
              alt="Ethereum"
              width={16}
              height={16}
              className="mr-2"
            />
            <span>Sign in with Ethereum</span>
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
