'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { PaymentTransfer } from '@/components/payment-transfer/payment-transfer';
import { useCheckoutSessionOptions } from '@/hooks/use-checkout-session';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const {
    data: checkoutSession,
    isLoading,
    error,
  } = useQuery(useCheckoutSessionOptions(sessionId || ''));

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Missing Session ID
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please provide a valid checkout session ID.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Loading checkout session...
          </p>
        </div>
      </div>
    );
  }

  if (error || !checkoutSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-red-600 dark:text-red-400">
            Error Loading Session
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {error instanceof Error
              ? error.message
              : 'Failed to load checkout session'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
      <PaymentTransfer checkoutSession={checkoutSession} />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
