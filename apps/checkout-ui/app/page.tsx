'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { checkoutSessionByIdOptions } from '@/api/checkout-session';
import { ErrorState } from '@/app/_components/error-state';
import { LoadingState } from '@/app/_components/loading-state';
import { MissingSessionId } from '@/app/_components/missing-session-id';
import { PaymentTransfer } from '@/components/payment-transfer/payment-transfer';
import { CheckoutSessionProvider } from '@/contexts/checkout-session-context';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const {
    data: checkoutSession,
    isLoading,
    error,
  } = useQuery({
    ...checkoutSessionByIdOptions(sessionId as string),
    enabled: !!sessionId,
  });

  if (!sessionId) {
    return <MissingSessionId />;
  }

  if (isLoading) {
    return <LoadingState message="Loading checkout session..." />;
  }

  if (error || !checkoutSession) {
    return <ErrorState error={error} />;
  }

  return (
    <CheckoutSessionProvider checkoutSession={checkoutSession}>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-black">
        <PaymentTransfer />
      </div>
    </CheckoutSessionProvider>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutContent />
    </Suspense>
  );
}
