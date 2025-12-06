'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import type { ExchangeRate, PublicCheckoutSession } from '@workspace/shared';

interface ExchangeRateProps {
  checkoutSession: PublicCheckoutSession;
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: ExchangeRate;
  isLoading: boolean;
}

export function ExchangeRate({
  checkoutSession,
  cryptoCurrency,
  exchangeRate,
  isLoading,
}: ExchangeRateProps) {
  const ratePerUnit = exchangeRate.rate > 0 ? 1 / exchangeRate.rate : 0;

  function getText(): string {
    if (isLoading) return 'Loading exchange rate...';
    return `Exchange Rate: 1 ${checkoutSession.fiatCurrency} ≈ ${ratePerUnit.toFixed(6)} ${cryptoCurrency}`;
  }

  function getTooltipText(): string {
    if (isLoading) return 'Fetching latest exchange rate...';
    const rateText = `Rate: ${exchangeRate.rate.toFixed(2)} ${checkoutSession.fiatCurrency} per ${cryptoCurrency}`;

    const timestamp = new Date(exchangeRate.timestamp).toLocaleTimeString();
    return `${rateText} (updated ${timestamp})`;
  }

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
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {getText()}
        </motion.span>
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
