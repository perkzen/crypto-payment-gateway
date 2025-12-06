'use client';

import { AnimatePresence, motion } from 'framer-motion';

type PaymentStatus = 'completed' | 'expired' | 'canceled' | 'open';

interface PaymentTitleProps {
  status: PaymentStatus;
}

interface PaymentTitleState {
  status: PaymentStatus;
  id: string;
  className: string;
  text: string;
}

const paymentStates: PaymentTitleState[] = [
  {
    id: 'completed-title',
    status: 'completed',
    className:
      'text-lg font-semibold uppercase tracking-tighter text-zinc-900 dark:text-zinc-100',
    text: 'Payment Completed',
  },
  {
    id: 'expired-title',
    status: 'expired',
    className:
      'text-lg font-semibold uppercase tracking-tighter text-red-600 dark:text-red-400',
    text: 'Session Expired',
  },
  {
    id: 'canceled-title',
    status: 'canceled',
    className:
      'text-lg font-semibold uppercase tracking-tighter text-red-600 dark:text-red-400',
    text: 'Payment Canceled',
  },
  {
    id: 'progress-title',
    status: 'open',
    className:
      'text-lg font-semibold uppercase tracking-tighter text-zinc-900 dark:text-zinc-100',
    text: 'Payment in Progress',
  },
];

export function PaymentTitle({ status }: PaymentTitleProps) {
  const { id, className, text } = paymentStates.find(
    (state) => state.status === status,
  )!;

  return (
    <AnimatePresence mode="wait">
      <motion.h2
        key={id}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {text}
      </motion.h2>
    </AnimatePresence>
  );
}
