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
import { ErrorAlert } from '@/components/error-alert';
import { useCheckoutSession } from '@/contexts/checkout-session-context';
import { usePayment } from '@/contexts/payment-context';
import { useCountdown } from '@/hooks/use-countdown';
import { useRedirectCountdown } from '@/hooks/use-redirect-countdown';
import { calculatePaymentAmounts } from '@/lib/utils/payment-calculations';

export function PaymentTransfer() {
  const checkoutSession = useCheckoutSession();
  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0]!;
  const fiatCurrency = checkoutSession.fiatCurrency;

  const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useQuery(
    exchangeRateOptions(cryptoCurrency, fiatCurrency),
  );

  const { getPaymentStatus, transactionError } = usePayment();

  const paymentStatus = getPaymentStatus(checkoutSession);
  const isCompleted = paymentStatus === 'completed';

  const { redirectCountdown, shouldShowRedirect } = useRedirectCountdown({
    status: paymentStatus,
    checkoutSession,
  });

  // Get expiration countdown
  const { minutes, seconds, isExpired } = useCountdown(
    new Date(checkoutSession.expiresAt),
  );

  // Determine which countdown to use: redirect countdown or expiration countdown
  const countdown =
    shouldShowRedirect && redirectCountdown > 0
      ? {
          minutes: 0,
          seconds: redirectCountdown,
          isExpired: false,
        }
      : {
          minutes,
          seconds,
          isExpired,
        };

  const { exchangeRate, fiatAmount, cryptoAmount } = calculatePaymentAmounts({
    exchangeRateData,
    fiatAmountInCents: checkoutSession.amountFiat,
    fiatCurrency,
  });

  const isPaymentExpired = paymentStatus === 'expired';
  const hoverBorderClass = isPaymentExpired
    ? 'hover:border-red-500/20 dark:hover:border-red-500/20'
    : 'hover:border-emerald-500/20 dark:hover:border-emerald-500/20';

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
        {transactionError && (
          <ErrorAlert
            title="Payment Failed"
            message={transactionError.message}
            variant="inline"
            className="w-full"
          />
        )}
        <Card
          className={`flex h-[420px] w-full flex-col border border-zinc-200/60 bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-500 ${hoverBorderClass} dark:border-zinc-800/60 dark:bg-zinc-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]`}
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
                <PaymentStatus status={paymentStatus} countdown={countdown} />

                <PaymentDetails
                  checkoutSession={checkoutSession}
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
      </div>
    </TooltipProvider>
  );
}
