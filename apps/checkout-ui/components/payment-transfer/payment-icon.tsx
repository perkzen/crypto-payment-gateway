'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check, X } from 'lucide-react';

type PaymentStatus = 'completed' | 'expired' | 'canceled' | 'open';

interface PaymentIconProps {
  status: PaymentStatus;
}

interface PaymentIconState {
  status: PaymentStatus;
  id: string;
  render: () => ReactNode;
}

function ProgressIcon() {
  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        rotate: 360,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      className="flex h-[100px] w-[100px] items-center justify-center"
    >
      <div className="relative z-10">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderLeftColor: 'rgb(16 185 129)',
            borderTopColor: 'rgb(16 185 129 / 0.2)',
            filter: 'blur(0.5px)',
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.02, 1],
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
        <div className="relative z-10 rounded-full bg-white p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:bg-zinc-900">
          <ArrowUpDown className="h-10 w-10 text-emerald-500" />
        </div>
      </div>
    </motion.div>
  );
}

function CompletedIcon() {
  return (
    <motion.div
      key="completed"
      initial={{
        opacity: 0,
        scale: 0.5,
        rotate: -180,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex h-[100px] w-[100px] items-center justify-center"
      aria-label="Payment completed"
    >
      <motion.div
        className="relative z-10 rounded-full border-2 border-emerald-500 bg-white p-5 shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:bg-zinc-900"
        title="Payment completed"
        initial={{ scale: 0.8 }}
        animate={{
          scale: [0.8, 1.1, 1],
          boxShadow: [
            '0_0_20px_rgba(16,185,129,0.3)',
            '0_0_30px_rgba(16,185,129,0.5)',
            '0_0_20px_rgba(16,185,129,0.3)',
          ],
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Check
            className="h-10 w-10 text-emerald-500"
            strokeWidth={3.5}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ExpiredIcon() {
  return (
    <motion.div
      key="expired-error-icon"
      initial={{
        opacity: 0,
        rotate: -180,
      }}
      animate={{
        opacity: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      className="flex h-[100px] w-[100px] items-center justify-center"
      aria-label="Session expired"
    >
      <div
        className="relative z-10 rounded-full border border-red-500 bg-white p-5 dark:border-red-500 dark:bg-zinc-900"
        title="Session expired"
      >
        <X
          className="h-10 w-10 text-red-500"
          strokeWidth={3.5}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

function ErrorIcon() {
  return (
    <motion.div
      key="canceled-error-icon"
      initial={{
        opacity: 0,
        rotate: -180,
      }}
      animate={{
        opacity: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
      }}
      className="flex h-[100px] w-[100px] items-center justify-center"
      aria-label="Payment canceled"
    >
      <div
        className="relative z-10 rounded-full border border-red-500 bg-white p-5 dark:border-red-500 dark:bg-zinc-900"
        title="Payment canceled"
      >
        <X
          className="h-10 w-10 text-red-500"
          strokeWidth={3.5}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

const paymentIconStates: PaymentIconState[] = [
  {
    status: 'completed',
    id: 'completed-icon',
    render: () => <CompletedIcon />,
  },
  {
    status: 'expired',
    id: 'expired-error-icon',
    render: () => <ExpiredIcon />,
  },
  {
    status: 'canceled',
    id: 'canceled-error-icon',
    render: () => <ErrorIcon />,
  },
  {
    status: 'open',
    id: 'progress-icon',
    render: () => <ProgressIcon />,
  },
];

export function PaymentIcon({ status }: PaymentIconProps) {
  const { render } = paymentIconStates.find(
    (state) => state.status === status,
  )!;

  const isExpired = status === 'expired';
  const glowClass = isExpired
    ? 'bg-red-500/10 dark:bg-red-500/5'
    : 'bg-emerald-500/10 dark:bg-emerald-500/5';

  return (
    <div className="flex h-[80px] items-center justify-center">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative flex h-[100px] w-[100px] items-center justify-center">
          <motion.div
            className={`absolute inset-0 rounded-full ${glowClass} blur-2xl`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          />
          <AnimatePresence mode="wait">{render()}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
