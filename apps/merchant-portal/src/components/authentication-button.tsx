'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';
import { useSession } from '@/lib/auth';

const ETHEREUM_ICON_URL =
  'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040';

export function AuthenticationButton() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect to dashboard after successful authentication
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!ready) {
          return (
            <Button disabled size="lg">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button onClick={openConnectModal} size="lg">
              <Image
                src={ETHEREUM_ICON_URL}
                alt="Ethereum"
                width={16}
                height={16}
                className="mr-2"
              />
              Sign in with Ethereum
            </Button>
          );
        }

        // If connected and authenticated, button displays loading (redirect will happen)
        return (
          <Button disabled size="lg">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}
