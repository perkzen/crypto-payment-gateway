'use client';

import { type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { type useAccount } from 'wagmi';

type PaymentStatusType = 'confirmed' | 'error' | 'pending' | 'idle';

interface PaymentStatusProps {
  isConfirmed: boolean;
  transactionError: Error | null;
  hash: `0x${string}` | undefined;
  chain: ReturnType<typeof useAccount>['chain'];
}

interface PaymentStatusParams {
  transactionError: Error | null;
  hash: `0x${string}` | undefined;
  chain: ReturnType<typeof useAccount>['chain'];
}

interface PaymentStatusState {
  status: PaymentStatusType;
  render: (params: PaymentStatusParams) => ReactNode;
}

function getPaymentStatusType(
  isConfirmed: boolean,
  transactionError: Error | null,
  hash: `0x${string}` | undefined,
): PaymentStatusType {
  if (isConfirmed) return 'confirmed';
  if (transactionError) return 'error';
  if (hash) return 'pending';
  return 'idle';
}

function ConfirmedStatus() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-full bg-emerald-500/10 p-3">
        <Check className="h-6 w-6 text-emerald-500" />
      </div>
      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        Payment confirmed!
      </p>
    </div>
  );
}

function ErrorStatus({ transactionError }: { transactionError: Error | null }) {
  return (
    <div className="text-center text-sm text-red-600 dark:text-red-400">
      {transactionError?.message || 'Transaction failed'}
    </div>
  );
}

function PendingStatus({ hash, chain }: PaymentStatusParams) {
  if (!hash) return null;

  return (
    <a
      href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground text-xs underline"
    >
      View transaction on {chain?.blockExplorers?.default?.name || 'Explorer'}
    </a>
  );
}

const paymentStatusStates: PaymentStatusState[] = [
  {
    status: 'confirmed',
    render: () => <ConfirmedStatus />,
  },
  {
    status: 'error',
    render: ({ transactionError }) => (
      <ErrorStatus transactionError={transactionError} />
    ),
  },
  {
    status: 'pending',
    render: ({ hash, chain, transactionError }) => (
      <PendingStatus
        hash={hash}
        chain={chain}
        transactionError={transactionError}
      />
    ),
  },
  {
    status: 'idle',
    render: () => null,
  },
];

export function PaymentStatus({
  isConfirmed,
  transactionError,
  hash,
  chain,
}: PaymentStatusProps) {
  const type = getPaymentStatusType(isConfirmed, transactionError, hash);
  const status = paymentStatusStates.find((state) => state.status === type)!;

  return status.render({ transactionError, hash, chain });
}
