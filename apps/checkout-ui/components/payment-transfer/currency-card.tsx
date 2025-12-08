'use client';

import { type ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface CurrencyCardProps {
  label: string;
  icon: ReactNode;
  amount: string;
  description: ReactNode;
  currencySymbol?: string;
  currencyIconUrl?: string;
  isCompleted: boolean;
  isTop?: boolean;
}

export function CurrencyCard({
  label,
  icon,
  amount,
  description,
  currencySymbol,
  currencyIconUrl,
  isCompleted,
  isTop = false,
}: CurrencyCardProps) {
  return (
    <motion.div
      className={cn(
        'w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 backdrop-blur-md transition-all duration-300 dark:border-zinc-700/50 dark:bg-zinc-800/50',
        isCompleted
          ? isTop
            ? 'rounded-b-none border-b-0'
            : 'rounded-t-none border-t-0'
          : 'hover:border-emerald-500/30',
      )}
      animate={{
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <div className="w-full space-y-1">
        <motion.span
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {icon}
          {label}
        </motion.span>
        <div className="flex flex-col gap-1.5">
          <motion.div
            className="group flex items-center gap-2.5"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.span
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-900 shadow-lg transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              whileHover={{
                scale: 1.05,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 10,
              }}
            >
              {currencyIconUrl ? (
                <Image
                  src={currencyIconUrl}
                  alt={description}
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              ) : (
                currencySymbol
              )}
            </motion.span>
            <div className="flex flex-col items-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isCompleted ? 'completed-amount' : 'processing-amount'}
                  className={cn(
                    'font-medium tracking-tight text-zinc-900 dark:text-zinc-100',
                  )}
                  initial={{
                    opacity: isCompleted ? 1 : 0.5,
                  }}
                  animate={{
                    opacity: isCompleted ? 1 : 0.5,
                  }}
                  exit={{
                    opacity: isCompleted ? 1 : 0.5,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {amount}
                </motion.span>
              </AnimatePresence>
              <motion.span
                className="text-xs text-zinc-500 dark:text-zinc-400"
                initial={{
                  opacity: 1,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {description}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
