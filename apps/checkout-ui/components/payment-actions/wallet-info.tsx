'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';

export function WalletInfo() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!connected) return null;

        return (
          <div className="bg-card flex w-full items-center justify-between gap-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    overflow: 'hidden',
                    marginRight: 4,
                  }}
                >
                  {chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {account.displayName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {chain.name}
                </span>
              </div>
            </div>
            <Button onClick={openAccountModal} variant="ghost" size="sm">
              Manage
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
