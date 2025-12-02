'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface PaymentIconProps {
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

export function PaymentIcon({
  isCompleted,
  isExpired,
  isCanceled,
}: PaymentIconProps) {
  return (
    <div className="h-[80px] flex items-center justify-center">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative w-[100px] h-[100px] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 blur-2xl bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full"
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
          <AnimatePresence mode="wait">
            {!isCompleted && !isExpired && !isCanceled ? (
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
                className="w-[100px] h-[100px] flex items-center justify-center"
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
                  <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-full p-5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <ArrowUpDown className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>
              </motion.div>
            ) : (
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
                className="w-[100px] h-[100px] flex items-center justify-center"
              >
                <div
                  className={cn(
                    'relative z-10 bg-white dark:bg-zinc-900 rounded-full p-5 border',
                    isCompleted
                      ? 'border-emerald-500'
                      : 'border-red-500 dark:border-red-500',
                  )}
                >
                  <Check
                    className={cn(
                      'h-10 w-10',
                      isCompleted ? 'text-emerald-500' : 'text-red-500',
                    )}
                    strokeWidth={3.5}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

