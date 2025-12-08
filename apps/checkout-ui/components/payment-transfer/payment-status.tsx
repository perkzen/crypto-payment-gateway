'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCheckoutSession } from '@/contexts/checkout-session-context';
import { formatCountdown } from '@/hooks/use-countdown';

type PaymentStatus = 'completed' | 'expired' | 'open';

export interface Countdown {
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

interface PaymentStatusTextProps {
  checkoutSession: ReturnType<typeof useCheckoutSession>;
  countdown: Countdown;
}

interface PaymentStatusState {
  status: PaymentStatus;
  id: string;
  className: string;
  getText: (props: PaymentStatusTextProps) => string;
}

interface PaymentStatusProps {
  status: PaymentStatus;
  countdown: Countdown;
}

function isRedirectCountdownActive(
  countdown?: Countdown,
): countdown is Countdown {
  return (
    countdown !== undefined && countdown.seconds > 0 && countdown.minutes === 0
  );
}

function isExpirationCountdownActive(
  countdown?: Countdown,
): countdown is Countdown {
  return countdown !== undefined && !countdown.isExpired;
}

function formatRedirectCountdown(seconds: number): string {
  return `Redirecting in ${seconds}s...`;
}

function formatExpirationCountdown(countdown: Countdown): string {
  return `Expires in ${formatCountdown(countdown.minutes, countdown.seconds)}`;
}

const paymentStatusStates: PaymentStatusState[] = [
  {
    status: 'completed',
    id: 'completed-id',
    className: 'text-xs font-medium text-emerald-600 dark:text-emerald-400',
    getText: ({ countdown }) => {
      if (isRedirectCountdownActive(countdown)) {
        return formatRedirectCountdown(countdown.seconds);
      }
      return '';
    },
  },
  {
    status: 'expired',
    id: 'expired-id',
    className: 'text-xs font-medium text-red-600 dark:text-red-400',
    getText: ({ countdown }) => {
      const baseText = 'This session has expired';
      if (isRedirectCountdownActive(countdown)) {
        return `${baseText} • ${formatRedirectCountdown(countdown.seconds)}`;
      }
      return baseText;
    },
  },
  {
    status: 'open',
    id: 'progress-status',
    className: 'text-xs font-medium text-emerald-600 dark:text-emerald-400',
    getText: ({ countdown }) => {
      if (isExpirationCountdownActive(countdown)) {
        return formatExpirationCountdown(countdown);
      }
      return 'Payment pending...';
    },
  },
];

export function PaymentStatus({ status, countdown }: PaymentStatusProps) {
  const checkoutSession = useCheckoutSession();
  const { id, className, getText } = paymentStatusStates.find(
    (state) => state.status === status,
  )!;

  const getDisplayText = () => {
    return getText({
      checkoutSession,
      countdown,
    });
  };

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
        {getDisplayText()}
      </motion.div>
    </AnimatePresence>
  );
}
