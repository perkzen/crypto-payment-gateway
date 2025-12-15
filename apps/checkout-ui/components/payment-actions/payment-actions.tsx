'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWriteCryptoPayPayNative } from '@workspace/shared';
import { parseEther } from 'viem';
import { hardhat } from 'viem/chains';
import {
  useBalance,
  useConnection,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { exchangeRateOptions } from '@/api/exchange-rate';
import { ErrorAlert } from '@/components/error-alert';
import { ConnectWalletButton } from '@/components/payment-actions/connect-wallet-button';
import {
  PayButton,
  type PayButtonStatus,
} from '@/components/payment-actions/pay-button';
import { PaymentStatus } from '@/components/payment-actions/payment-status';
import { WalletInfo } from '@/components/payment-actions/wallet-info';
import { useCheckoutSession } from '@/contexts/checkout-session-context';
import { usePayment } from '@/contexts/payment-context';
import { PAYMENT_CONTRACT_ADDRESS } from '@/lib/constants';
import { getChainFromNetworkName } from '@/lib/utils/network';
import { calculatePaymentAmounts } from '@/lib/utils/payment-calculations';

function getPayButtonStatus(
  isLoading: boolean,
  isTransactionPending: boolean,
  isConfirming: boolean,
): PayButtonStatus {
  if (!isLoading) return 'idle';
  if (isTransactionPending) return 'transaction-pending';
  if (isConfirming) return 'confirming';
  return 'processing';
}

const getCheckoutSessionErrorMessage = (
  { isSessionExpired, isSessionCompleted } = {
    isSessionExpired: false,
    isSessionCompleted: false,
  },
) => {
  if (isSessionCompleted) {
    return 'This checkout session has already been completed.';
  }
  if (isSessionExpired) {
    return 'This checkout session has expired.';
  }
  return null;
};

export function PaymentActions() {
  const checkoutSession = useCheckoutSession();
  const { isConnected, address, chainId, chain } = useConnection();
  const switchChain = useSwitchChain();
  const { setIsPaymentConfirmed, transactionError, setTransactionError } =
    usePayment();

  const { data: balance } = useBalance({
    address,
  });

  const requiredNetwork = checkoutSession.allowedNetworks[0]!;
  const requiredChain = getChainFromNetworkName(requiredNetwork);
  const requiredChainId = requiredChain.id;
  const isOnRequiredNetwork = chainId === requiredChainId;
  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0]!;
  const fiatCurrency = checkoutSession.fiatCurrency;

  const { data: exchangeRateData } = useQuery(
    exchangeRateOptions(cryptoCurrency, fiatCurrency),
  );

  const { cryptoAmount } = calculatePaymentAmounts({
    exchangeRateData,
    fiatAmountInCents: checkoutSession.amountFiat,
    fiatCurrency,
  });

  const checkoutSessionId = checkoutSession.hashedId as `0x${string}`;
  const merchantAddress =
    checkoutSession.merchantWalletAddress as `0x${string}`;
  const paymentAmount = parseEther(cryptoAmount.toString());

  const {
    writeContract,
    data: hash,
    isPending: isTransactionPending,
    error: writeError,
  } = useWriteCryptoPayPayNative();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Sync errors and confirmation status to context
  useEffect(() => {
    if (receiptError) {
      setTransactionError(
        receiptError instanceof Error
          ? receiptError
          : new Error('Transaction failed'),
      );
    } else if (writeError) {
      setTransactionError(writeError ?? null);
    }
    if (isConfirmed) setIsPaymentConfirmed(true);
  }, [
    receiptError,
    writeError,
    isConfirmed,
    setTransactionError,
    setIsPaymentConfirmed,
  ]);

  const isSessionExpired = new Date() > new Date(checkoutSession.expiresAt);
  const isSessionCompleted = checkoutSession.completedAt !== null;

  const sessionError = getCheckoutSessionErrorMessage({
    isSessionExpired,
    isSessionCompleted,
  });

  // Handle payment
  const handlePay = () => {
    if (!isOnRequiredNetwork) {
      switchChain.mutate({ chainId: requiredChainId });
      return;
    }

    if (balance && balance.value < paymentAmount) {
      const balanceEth = Number(balance.value) / 1e18;
      setTransactionError(
        new Error(
          `Insufficient balance. You have ${balanceEth.toFixed(4)} ETH but need ${cryptoAmount} ETH for payment.`,
        ),
      );
      return;
    }

    setTransactionError(null);

    writeContract({
      address: PAYMENT_CONTRACT_ADDRESS as `0x${string}`,
      args: [checkoutSessionId, merchantAddress],
      value: paymentAmount,
    });
  };

  // Determine button status
  const payButtonStatus = getPayButtonStatus(
    isTransactionPending || isConfirming,
    isTransactionPending,
    isConfirming,
  );

  // Can pay if: has amount, not already processing, contract is ready, on required network, and session is valid
  const canPay =
    !!cryptoAmount &&
    !isTransactionPending &&
    !isConfirming &&
    !isConfirmed &&
    !!writeContract &&
    isOnRequiredNetwork &&
    !isSessionExpired &&
    !isSessionCompleted;

  // Show connect button if wallet not connected
  if (!isConnected) {
    return <ConnectWalletButton />;
  }

  // Show success status if payment confirmed
  if (isConfirmed) {
    return (
      <div className="text-center text-sm text-emerald-600 dark:text-emerald-400">
        Payment confirmed!
      </div>
    );
  }

  // Show payment interface when wallet is connected
  return (
    <div className="flex flex-col items-center gap-4">
      <WalletInfo />
      {sessionError && (
        <ErrorAlert
          title="Checkout Session Error"
          message={sessionError}
          variant="inline"
          className="w-full"
        />
      )}
      <PayButton
        onPay={handlePay}
        status={payButtonStatus}
        canPay={canPay}
        cryptoAmount={cryptoAmount || 0}
        cryptoCurrency={cryptoCurrency}
      />
      {!transactionError && (
        <PaymentStatus
          isConfirmed={isConfirmed}
          transactionError={null}
          hash={hash}
          chain={chain}
        />
      )}
    </div>
  );
}
