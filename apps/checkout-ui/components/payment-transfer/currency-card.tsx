'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';

interface CurrencyCardProps {
  label: string;
  icon: React.ReactNode;
  amount: string;
  description: string;
  currencySymbol: string;
  isCompleted: boolean;
  isTop?: boolean;
}

export function CurrencyCard({
  label,
  icon,
  amount,
  description,
  currencySymbol,
  isCompleted,
  isTop = false,
}: CurrencyCardProps) {
  return (
    <motion.div
      className={cn(
        'w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 border border-zinc-200 dark:border-zinc-700/50 backdrop-blur-md transition-all duration-300',
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
      <div className="space-y-1 w-full">
        <motion.span
          className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
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
            className="flex items-center gap-2.5 group"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 shadow-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
              whileHover={{
                scale: 1.05,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 10,
              }}
            >
              {currencySymbol}
            </motion.span>
            <div className="flex flex-col items-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isCompleted ? 'completed-amount' : 'processing-amount'}
                  className={cn(
                    'font-medium text-zinc-900 dark:text-zinc-100 tracking-tight',
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

