'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PublicCheckoutSession } from '@workspace/shared';

interface PaymentStatusProps {
  checkoutSession: PublicCheckoutSession;
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

export function PaymentStatus({
  checkoutSession,
  isCompleted,
  isExpired,
  isCanceled,
}: PaymentStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {isCompleted ? (
        <motion.div
          key="completed-id"
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Session ID: {checkoutSession.id.slice(0, 8)}...
        </motion.div>
      ) : isExpired || isCanceled ? (
        <motion.div
          key="error-status"
          className="text-xs text-red-600 dark:text-red-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {isExpired
            ? 'This session has expired'
            : 'This payment was canceled'}
        </motion.div>
      ) : (
        <motion.div
          key="progress-status"
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Processing Payment...
        </motion.div>
      )}
    </AnimatePresence>
  );
}

