'use client';

import { cn } from '@workspace/ui/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check } from 'lucide-react';
import { type ReactNode } from 'react';

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
    >
      <div className="relative z-10 rounded-full border border-emerald-500 bg-white p-5 dark:bg-zinc-900">
        <Check className="h-10 w-10 text-emerald-500" strokeWidth={3.5} />
      </div>
    </motion.div>
  );
}

function ErrorIcon() {
  return (
    <motion.div
      key="error"
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
    >
      <div className="relative z-10 rounded-full border border-red-500 bg-white p-5 dark:border-red-500 dark:bg-zinc-900">
        <Check className="h-10 w-10 text-red-500" strokeWidth={3.5} />
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
    id: 'error-icon',
    render: () => <ErrorIcon />,
  },
  {
    status: 'canceled',
    id: 'error-icon',
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
            className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/5"
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
