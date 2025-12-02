'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import type { PublicCheckoutSession } from '@workspace/shared';
import { formatCryptoAmount, getFiatCurrencySymbol } from '@workspace/shared';
import { CurrencyCard } from './currency-card';

interface PaymentDetailsProps {
  checkoutSession: PublicCheckoutSession;
  fiatAmount: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  cryptoSymbol: string;
  isCompleted: boolean;
}

export function PaymentDetails({
  checkoutSession,
  fiatAmount,
  cryptoAmount,
  cryptoCurrency,
  cryptoSymbol,
  isCompleted,
}: PaymentDetailsProps) {
  return (
    <motion.div
      className="flex items-center gap-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className="flex flex-col items-start relative"
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
            icon={<ArrowUpIcon className="w-3 h-3" />}
            amount={fiatAmount}
            description="Fiat Payment"
            currencySymbol={getFiatCurrencySymbol(checkoutSession.fiatCurrency)}
            isCompleted={isCompleted}
            isTop={true}
          />
          <CurrencyCard
            label="To"
            icon={<ArrowDownIcon className="w-3 h-3" />}
            amount={formatCryptoAmount(cryptoAmount, cryptoCurrency)}
            description={`${checkoutSession.allowedNetworks[0] || 'ethereum'} Network`}
            currencySymbol={cryptoSymbol}
            isCompleted={isCompleted}
            isTop={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

