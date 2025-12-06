'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { motion } from 'framer-motion';
import { PaymentActions } from '../payment-actions/payment-actions';
import { ExchangeRate } from './exchange-rate';
import { PaymentDetails } from './payment-details';
import { PaymentIcon } from './payment-icon';
import { PaymentStatus } from './payment-status';
import { PaymentTitle } from './payment-title';
import type { PublicCheckoutSession } from '@workspace/shared';

interface PaymentTransferProps {
  checkoutSession: PublicCheckoutSession;
}

export function PaymentTransfer({ checkoutSession }: PaymentTransferProps) {
  // Placeholder values - logic will be implemented later
  const isCompleted = false;
  const isExpired = checkoutSession.status === 'expired';
  const isCanceled = checkoutSession.status === 'canceled';
  const paymentStatus = checkoutSession.status as 'completed' | 'expired' | 'canceled' | 'open';
  const fiatAmount = '50.00 USD'; // Placeholder
  const cryptoAmount = 0.001; // Placeholder
  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0] || 'ETH';
  const cryptoSymbol = 'Ξ'; // Placeholder
  const exchangeRate = 3000; // Placeholder
  const isLoading = false; // Placeholder

  return (
    <TooltipProvider>
      <Card className="mx-auto flex h-[420px] w-full max-w-sm flex-col border border-zinc-200/60 bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/20 dark:border-zinc-800/60 dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)] dark:hover:border-emerald-500/20">
        <CardContent className="flex flex-1 flex-col justify-center space-y-4">
          <PaymentIcon
            isCompleted={isCompleted}
            isExpired={isExpired}
            isCanceled={isCanceled}
          />

          <div className="flex h-[280px] flex-col">
            <motion.div
              className="mb-4 w-full space-y-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <PaymentTitle status={paymentStatus} />
              <PaymentStatus
                checkoutSession={checkoutSession}
                status={paymentStatus}
              />

              <PaymentDetails
                checkoutSession={checkoutSession}
                fiatAmount={fiatAmount}
                cryptoAmount={cryptoAmount}
                cryptoCurrency={cryptoCurrency}
                cryptoSymbol={cryptoSymbol}
                isCompleted={isCompleted}
              />

              <ExchangeRate
                checkoutSession={checkoutSession}
                cryptoAmount={cryptoAmount}
                cryptoCurrency={cryptoCurrency}
                exchangeRate={exchangeRate}
                isCompleted={isCompleted}
                isLoading={isLoading}
              />
            </motion.div>
          </div>

          {/* Payment Actions */}
          {checkoutSession.status === 'open' && (
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <PaymentActions
                checkoutSession={checkoutSession}
                exchangeRate={exchangeRate}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
