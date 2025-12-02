'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import type { PublicCheckoutSession } from '@workspace/shared';

interface ExchangeRateProps {
  checkoutSession: PublicCheckoutSession;
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: number;
  isCompleted: boolean;
  isLoading: boolean;
}

export function ExchangeRate({
  checkoutSession,
  cryptoCurrency,
  exchangeRate,
  isCompleted,
  isLoading,
}: ExchangeRateProps) {
  const ratePerUnit = 1 / exchangeRate;

  return (
    <motion.div
      className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.5,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <AnimatePresence mode="wait">
        {isCompleted && !isLoading ? (
          <motion.span
            key="completed-rate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Exchange Rate: 1 {checkoutSession.fiatCurrency} ≈{' '}
            {ratePerUnit.toFixed(6)} {cryptoCurrency}
          </motion.span>
        ) : (
          <motion.span
            key="calculating-rate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {isLoading
              ? 'Loading exchange rate...'
              : 'Calculating exchange rate...'}
          </motion.span>
        )}
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isCompleted && !isLoading
              ? `Rate: ${exchangeRate.toFixed(2)} ${checkoutSession.fiatCurrency} per ${cryptoCurrency} (updated ${new Date().toLocaleTimeString()})`
              : 'Fetching latest exchange rate...'}
          </p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
