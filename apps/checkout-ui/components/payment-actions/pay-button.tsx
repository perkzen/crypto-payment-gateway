'use client';

import { type ReactNode } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Wallet } from 'lucide-react';
import type { PublicCheckoutSession } from '@workspace/shared';

type PayButtonStatus =
  | 'transaction-pending'
  | 'confirming'
  | 'processing'
  | 'idle';

export type { PayButtonStatus };

interface PayButtonProps {
  checkoutSession: PublicCheckoutSession;
  onPay: () => void;
  status: PayButtonStatus;
  canPay: boolean;
  cryptoAmount: number;
}

interface PayButtonStateParams {
  cryptoAmount: number;
}

interface PayButtonState {
  id: PayButtonStatus;
  getContent: (params: PayButtonStateParams) => ReactNode;
}

const payButtonStates: PayButtonState[] = [
  {
    id: 'transaction-pending',
    getContent: () => (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Waiting for confirmation...
      </>
    ),
  },
  {
    id: 'confirming',
    getContent: () => (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Confirming...
      </>
    ),
  },
  {
    id: 'processing',
    getContent: () => (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ),
  },
  {
    id: 'idle',
    getContent: ({ cryptoAmount }) => (
      <>
        <Wallet className="mr-2 h-4 w-4" />
        Pay {cryptoAmount.toFixed(6)} ETH
      </>
    ),
  },
];

export function PayButton({
  onPay,
  status,
  canPay,
  cryptoAmount,
}: PayButtonProps) {
  const { getContent } = payButtonStates.find((state) => state.id === status)!;

  return (
    <Button onClick={onPay} disabled={!canPay} className="w-full" size="lg">
      {getContent({ cryptoAmount })}
    </Button>
  );
}
