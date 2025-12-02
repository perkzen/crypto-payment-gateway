'use client';

import { Button } from '@workspace/ui/components/button';
import { Loader2, Wallet } from 'lucide-react';
import type { PublicCheckoutSession } from '@workspace/shared';

interface PayButtonProps {
  checkoutSession: PublicCheckoutSession;
  onPay: () => void;
  isLoading: boolean;
  isTransactionPending: boolean;
  isConfirming: boolean;
  canPay: boolean;
  cryptoAmount: number;
}

export function PayButton({
  onPay,
  isLoading,
  isTransactionPending,
  isConfirming,
  canPay,
  cryptoAmount,
}: PayButtonProps) {
  return (
    <Button onClick={onPay} disabled={!canPay} className="w-full" size="lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isTransactionPending
            ? 'Waiting for confirmation...'
            : isConfirming
              ? 'Confirming...'
              : 'Processing...'}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Pay {cryptoAmount.toFixed(6)} ETH
        </>
      )}
    </Button>
  );
}
