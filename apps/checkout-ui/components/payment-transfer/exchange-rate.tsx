'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import type { PublicCheckoutSession } from '@workspace/shared';

type ExchangeRateStatus = 'loading' | 'calculating' | 'completed';

interface ExchangeRateTextParams {
  checkoutSession: PublicCheckoutSession;
  cryptoCurrency: string;
  ratePerUnit: number;
}

interface ExchangeRateTooltipParams {
  checkoutSession: PublicCheckoutSession;
  cryptoCurrency: string;
  exchangeRate: number;
}

interface ExchangeRateProps {
  checkoutSession: PublicCheckoutSession;
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: number;
  isCompleted: boolean;
  isLoading: boolean;
}

interface ExchangeRateState {
  status: ExchangeRateStatus;
  id: string;
  getText: (params: ExchangeRateTextParams) => string;
  getTooltipText: (params: ExchangeRateTooltipParams) => string;
}

const exchangeRateStates: ExchangeRateState[] = [
  {
    status: 'loading',
    id: 'loading-rate',
    getText: () => 'Loading exchange rate...',
    getTooltipText: () => 'Fetching latest exchange rate...',
  },
  {
    status: 'calculating',
    id: 'calculating-rate',
    getText: () => 'Calculating exchange rate...',
    getTooltipText: () => 'Fetching latest exchange rate...',
  },
  {
    status: 'completed',
    id: 'completed-rate',
    getText: ({ checkoutSession, cryptoCurrency, ratePerUnit }) =>
      `Exchange Rate: 1 ${checkoutSession.fiatCurrency} ≈ ${ratePerUnit.toFixed(6)} ${cryptoCurrency}`,
    getTooltipText: ({ checkoutSession, cryptoCurrency, exchangeRate }) =>
      `Rate: ${exchangeRate.toFixed(2)} ${checkoutSession.fiatCurrency} per ${cryptoCurrency} (updated ${new Date().toLocaleTimeString()})`,
  },
];

function getExchangeRateStatus(
  isCompleted: boolean,
  isLoading: boolean,
): ExchangeRateStatus {
  if (isLoading) return 'loading';
  if (isCompleted) return 'completed';
  return 'calculating';
}

export function ExchangeRate({
  checkoutSession,
  cryptoCurrency,
  exchangeRate,
  isCompleted,
  isLoading,
}: ExchangeRateProps) {
  const ratePerUnit = 1 / exchangeRate;
  const status = getExchangeRateStatus(isCompleted, isLoading);
  const { id, getText, getTooltipText } = exchangeRateStates.find(
    (state) => state.status === status,
  )!;

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
          key={id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {getText({ checkoutSession, cryptoCurrency, ratePerUnit })}
        </motion.span>
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon className="h-3 w-3 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {getTooltipText({ checkoutSession, cryptoCurrency, exchangeRate })}
          </p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
}
