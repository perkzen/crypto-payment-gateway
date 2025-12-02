'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PaymentTitleProps {
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

export function PaymentTitle({
  isCompleted,
  isExpired,
  isCanceled,
}: PaymentTitleProps) {
  return (
    <AnimatePresence mode="wait">
      {isCompleted ? (
        <motion.h2
          key="completed-title"
          className="text-lg text-zinc-900 dark:text-zinc-100 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment Completed
        </motion.h2>
      ) : isExpired ? (
        <motion.h2
          key="expired-title"
          className="text-lg text-red-600 dark:text-red-400 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Session Expired
        </motion.h2>
      ) : isCanceled ? (
        <motion.h2
          key="canceled-title"
          className="text-lg text-red-600 dark:text-red-400 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment Canceled
        </motion.h2>
      ) : (
        <motion.h2
          key="progress-title"
          className="text-lg text-zinc-900 dark:text-zinc-100 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment in Progress
        </motion.h2>
      )}
    </AnimatePresence>
  );
}

