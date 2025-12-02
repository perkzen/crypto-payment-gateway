'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@workspace/ui/lib/utils';
import type { PublicCheckoutSession } from '@workspace/shared';
import { PaymentActions } from './payment-actions';
import {
  getCryptoCurrencySymbol,
  formatAmount,
  getFiatCurrencySymbol,
  calculateCryptoAmount,
} from '@/lib/utils';
import { useExchangeRateOptions } from '@/hooks/use-exchange-rate';

interface PaymentTransferProps {
  checkoutSession: PublicCheckoutSession;
}

// ==========================
// Sub-components
// ==========================

interface PaymentIconProps {
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

function PaymentIcon({ isCompleted, isExpired, isCanceled }: PaymentIconProps) {
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

interface PaymentTitleProps {
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

function PaymentTitle({
  isCompleted,
  isExpired,
  isCanceled,
}: PaymentTitleProps) {
  return (
    <AnimatePresence mode="wait">
      {isCompleted ? (
        <motion.h2
          key="completed-title"
          className="text-lg text-zinc-900 dark:text-zinc-100 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment Completed
        </motion.h2>
      ) : isExpired ? (
        <motion.h2
          key="expired-title"
          className="text-lg text-red-600 dark:text-red-400 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Session Expired
        </motion.h2>
      ) : isCanceled ? (
        <motion.h2
          key="canceled-title"
          className="text-lg text-red-600 dark:text-red-400 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment Canceled
        </motion.h2>
      ) : (
        <motion.h2
          key="progress-title"
          className="text-lg text-zinc-900 dark:text-zinc-100 tracking-tighter font-semibold uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Payment in Progress
        </motion.h2>
      )}
    </AnimatePresence>
  );
}

interface PaymentStatusProps {
  checkoutSession: PublicCheckoutSession;
  isCompleted: boolean;
  isExpired: boolean;
  isCanceled: boolean;
}

function PaymentStatus({
  checkoutSession,
  isCompleted,
  isExpired,
  isCanceled,
}: PaymentStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {isCompleted ? (
        <motion.div
          key="completed-id"
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Session ID: {checkoutSession.id.slice(0, 8)}...
        </motion.div>
      ) : isExpired || isCanceled ? (
        <motion.div
          key="error-status"
          className="text-xs text-red-600 dark:text-red-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {isExpired
            ? 'This session has expired'
            : 'This payment was canceled'}
        </motion.div>
      ) : (
        <motion.div
          key="progress-status"
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          Processing Payment...
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CurrencyCardProps {
  label: string;
  icon: React.ReactNode;
  amount: string;
  description: string;
  currencySymbol: string;
  isCompleted: boolean;
  isTop?: boolean;
}

function CurrencyCard({
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

interface ExchangeRateProps {
  checkoutSession: PublicCheckoutSession;
  cryptoAmount: number;
  cryptoCurrency: string;
  exchangeRate: number;
  isCompleted: boolean;
  isLoading: boolean;
}

function ExchangeRate({
  checkoutSession,
  cryptoAmount,
  cryptoCurrency,
  exchangeRate,
  isCompleted,
  isLoading,
}: ExchangeRateProps) {
  const ratePerUnit = 1 / exchangeRate;

  return (
    <motion.div
      className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2"
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
            {isLoading ? 'Loading exchange rate...' : 'Calculating exchange rate...'}
          </motion.span>
        )}
      </AnimatePresence>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon className="w-3 h-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
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

interface PaymentDetailsProps {
  checkoutSession: PublicCheckoutSession;
  fiatAmount: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  cryptoSymbol: string;
  isCompleted: boolean;
}

function PaymentDetails({
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
            amount={formatAmount(cryptoAmount, cryptoCurrency, true)}
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

// ==========================
// Main Component
// ==========================

export function PaymentTransfer({ checkoutSession }: PaymentTransferProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0] || 'ETH';
  const fiatCurrency = checkoutSession.fiatCurrency;

  // Poll exchange rate every 5 seconds
  const { data: exchangeRateData } = useQuery(
    useExchangeRateOptions(cryptoCurrency, fiatCurrency),
  );

  useEffect(() => {
    // Set completed if status is 'completed'
    if (checkoutSession.status === 'completed') {
      setIsCompleted(true);
    } else if (checkoutSession.status === 'open') {
      // Simulate completion after 1.5 seconds for demo purposes
      // In real app, this would be handled by polling or websockets
      const timer = setTimeout(() => {
        setIsCompleted(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // For expired/canceled, don't show as completed
      setIsCompleted(false);
    }
  }, [checkoutSession.status]);

  const fiatAmount = formatAmount(
    checkoutSession.amountFiat,
    checkoutSession.fiatCurrency,
  );
  const cryptoSymbol = getCryptoCurrencySymbol(cryptoCurrency);
  
  // Calculate crypto amount using real exchange rate
  const exchangeRate = exchangeRateData?.rate || 3000; // Fallback to mock rate
  const cryptoAmount = calculateCryptoAmount(
    checkoutSession.amountFiat,
    exchangeRate,
  );

  const isExpired = checkoutSession.status === 'expired';
  const isCanceled = checkoutSession.status === 'canceled';

  return (
    <TooltipProvider>
      <Card className="w-full max-w-sm mx-auto p-6 h-[420px] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-sm shadow-[0_0_0_1px_rgba(0,0,0,0.03)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-500">
        <CardContent className="flex-1 flex flex-col justify-center space-y-4">
          <PaymentIcon
            isCompleted={isCompleted}
            isExpired={isExpired}
            isCanceled={isCanceled}
          />

          <div className="h-[280px] flex flex-col">
            <motion.div
              className="space-y-2 text-center w-full mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <PaymentTitle
                isCompleted={isCompleted}
                isExpired={isExpired}
                isCanceled={isCanceled}
              />
              <PaymentStatus
                checkoutSession={checkoutSession}
                isCompleted={isCompleted}
                isExpired={isExpired}
                isCanceled={isCanceled}
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
                isLoading={!exchangeRateData}
              />
            </motion.div>
          </div>

          {/* Payment Actions */}
          {checkoutSession.status === 'open' && (
            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <PaymentActions
                checkoutSession={checkoutSession}
                exchangeRate={exchangeRate}
                onPaymentSuccess={() => setIsCompleted(true)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
