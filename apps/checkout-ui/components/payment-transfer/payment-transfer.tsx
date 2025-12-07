'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@workspace/ui/components/card';
import { TooltipProvider } from '@workspace/ui/components/tooltip';
import { motion } from 'framer-motion';
import { PaymentActions } from '../payment-actions/payment-actions';
import { ExchangeRateDisplay } from './exchange-rate-display';
import { PaymentDetails } from './payment-details';
import { PaymentIcon } from './payment-icon';
import { PaymentStatus } from './payment-status';
import { PaymentTitle } from './payment-title';
import { exchangeRateOptions } from '@/api/exchange-rate';
import { useCheckoutSession } from '@/contexts/checkout-session-context';
import { calculatePaymentAmounts } from '@/lib/utils/payment-calculations';

type PaymentStatus = 'completed' | 'expired' | 'canceled' | 'open';

function getPaymentStatus(expiresAt: Date): PaymentStatus {
  const now = new Date();
  if (now >= expiresAt) {
    return 'expired';
  }
  return 'open';
}

export function PaymentTransfer() {
  const checkoutSession = useCheckoutSession();
  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0] || 'ETH';
  const fiatCurrency = checkoutSession.fiatCurrency;

  const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useQuery(
    exchangeRateOptions(cryptoCurrency, fiatCurrency),
  );

  // Placeholder values - logic will be implemented later
  const isCompleted = false;
  const paymentStatus = getPaymentStatus(new Date(checkoutSession.expiresAt));

  const { exchangeRate, fiatAmount, cryptoAmount } = calculatePaymentAmounts({
    exchangeRateData,
    fiatAmountInCents: checkoutSession.amountFiat,
    fiatCurrency,
  });

  const isExpired = paymentStatus === 'expired';
  const hoverBorderClass = isExpired
    ? 'hover:border-red-500/20 dark:hover:border-red-500/20'
    : 'hover:border-emerald-500/20 dark:hover:border-emerald-500/20';

  return (
    <TooltipProvider>
      <Card
        className={`mx-auto flex h-[420px] w-full max-w-sm flex-col border border-zinc-200/60 bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-500 ${hoverBorderClass} dark:border-zinc-800/60 dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]`}
      >
        <CardContent className="flex flex-1 flex-col justify-center space-y-4">
          <PaymentIcon status={paymentStatus} />

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
              <PaymentStatus status={paymentStatus} />

              <PaymentDetails
                fiatAmount={fiatAmount}
                cryptoAmount={cryptoAmount}
                cryptoCurrency={cryptoCurrency}
                isCompleted={isCompleted}
              />
              {exchangeRate && (
                <ExchangeRateDisplay
                  cryptoAmount={cryptoAmount}
                  cryptoCurrency={cryptoCurrency}
                  exchangeRate={exchangeRate}
                  isLoading={isExchangeRateLoading}
                />
              )}
            </motion.div>
          </div>

          {/* Payment Actions */}
          {paymentStatus === 'open' && (
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <PaymentActions />
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
