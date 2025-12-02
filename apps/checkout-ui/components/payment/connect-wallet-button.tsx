'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';
import { ETHEREUM_ICON_URL } from '@/lib/constants';

interface ConnectWalletButtonProps {
  onConnect?: () => void;
}

export function ConnectWalletButton({ onConnect }: ConnectWalletButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <Button
            onClick={() => {
              openConnectModal();
              onConnect?.();
            }}
            disabled={!mounted}
            size="lg"
            className="w-full"
          >
            <Image
              src={ETHEREUM_ICON_URL}
              alt="Ethereum"
              width={16}
              height={16}
              className="mr-2"
            />
            <span>Connect Wallet</span>
          </Button>
        )}
      </ConnectButton.Custom>
      <p className="text-muted-foreground text-center text-sm">
        Connect your wallet to proceed with payment
      </p>
    </div>
  );
}

