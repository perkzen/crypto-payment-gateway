'use client';

import { Check } from 'lucide-react';
import { useAccount } from 'wagmi';

interface PaymentStatusProps {
  isConfirmed: boolean;
  transactionError: Error | null;
  hash: `0x${string}` | undefined;
  chain: ReturnType<typeof useAccount>['chain'];
}

export function PaymentStatus({
  isConfirmed,
  transactionError,
  hash,
  chain,
}: PaymentStatusProps) {
  if (isConfirmed) {
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

  return (
    <>
      {transactionError && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          {transactionError.message || 'Transaction failed'}
        </div>
      )}

      {hash && (
        <a
          href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground text-xs underline"
        >
          View transaction on{' '}
          {chain?.blockExplorers?.default?.name || 'Explorer'}
        </a>
      )}
    </>
  );
}

