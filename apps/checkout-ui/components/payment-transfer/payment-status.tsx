'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { PublicCheckoutSession } from '@workspace/shared';
import { useCountdown, formatCountdown } from '@/lib/hooks/use-countdown';

type PaymentStatus = 'completed' | 'expired' | 'canceled' | 'open';

interface PaymentStatusProps {
  checkoutSession: PublicCheckoutSession;
  status: PaymentStatus;
}

interface PaymentStatusState {
  status: PaymentStatus;
  id: string;
  className: string;
  getText: (checkoutSession: PublicCheckoutSession) => string;
}

const paymentStatusStates: PaymentStatusState[] = [
  {
    status: 'completed',
    id: 'completed-id',
    className: 'text-xs font-medium text-emerald-600 dark:text-emerald-400',
    getText: (checkoutSession) =>
      `Session ID: ${checkoutSession.id.slice(0, 8)}...`,
  },
  {
    status: 'expired',
    id: 'error-status',
    className: 'text-xs font-medium text-red-600 dark:text-red-400',
    getText: () => 'This session has expired',
  },
  {
    status: 'canceled',
    id: 'error-status',
    className: 'text-xs font-medium text-red-600 dark:text-red-400',
    getText: () => 'This payment was canceled',
  },
  {
    status: 'open',
    id: 'progress-status',
    className: 'text-xs font-medium text-emerald-600 dark:text-emerald-400',
    getText: () => 'Processing Payment...',
  },
];

export function PaymentStatus({
  checkoutSession,
  status,
}: PaymentStatusProps) {
  const { id, className, getText } = paymentStatusStates.find(
    (state) => state.status === status,
  )!;

  const { minutes, seconds, isExpired } = useCountdown(
    new Date(checkoutSession.expiresAt),
  );

  const displayText =
    status === 'open' && !isExpired
      ? `Expires in ${formatCountdown(minutes, seconds)}`
      : getText(checkoutSession);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className={className}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {displayText}
      </motion.div>
    </AnimatePresence>
  );
}
