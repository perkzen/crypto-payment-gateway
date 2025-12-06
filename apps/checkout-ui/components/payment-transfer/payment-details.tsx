'use client';

import {
  ETHEREUM_ICON_URL,
  formatCryptoAmount,
  getFiatCurrencySymbol,
} from '@workspace/shared';
import { motion } from 'framer-motion';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { CurrencyCard } from './currency-card';
import type { PublicCheckoutSession } from '@workspace/shared';

interface PaymentDetailsProps {
  checkoutSession: PublicCheckoutSession;
  fiatAmount: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  isCompleted: boolean;
}

export function PaymentDetails({
  checkoutSession,
  fiatAmount,
  cryptoAmount,
  cryptoCurrency,
  isCompleted,
}: PaymentDetailsProps) {
  return (
    <motion.div
      className="mt-4 flex items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="relative flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className="relative flex flex-col items-start"
          initial={{ gap: '12px' }}
          animate={{
            gap: isCompleted ? '0px' : '12px',
          }}
          transition={{
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <CurrencyCard
            label="From"
            icon={<ArrowUpIcon className="h-3 w-3" />}
            amount={fiatAmount}
            description="Fiat Payment"
            currencySymbol={getFiatCurrencySymbol(checkoutSession.fiatCurrency)}
            isCompleted={isCompleted}
            isTop={true}
          />
          <CurrencyCard
            label="To"
            icon={<ArrowDownIcon className="h-3 w-3" />}
            amount={formatCryptoAmount(cryptoAmount, cryptoCurrency)}
            description={`${checkoutSession.allowedNetworks[0] || 'ethereum'} Network`}
            currencyIconUrl={ETHEREUM_ICON_URL}
            isCompleted={isCompleted}
            isTop={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
