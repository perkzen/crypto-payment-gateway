'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWriteCryptoPayPayNative } from '@workspace/shared';
import { keccak256, parseEther, toHex } from 'viem';
import { hardhat } from 'viem/chains';
import {
  useAccount,
  useBalance,
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

export function PaymentActions() {
  const checkoutSession = useCheckoutSession();
  const { isConnected, address, chainId, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const {
    setTransactionHash,
    setIsPaymentConfirmed,
    transactionError,
    setTransactionError,
  } = usePayment();

  // Check account balance
  const { data: balance } = useBalance({
    address,
  });

  // Ensure we're on Hardhat network (Chain ID: 31337)
  const isHardhatNetwork = chainId === hardhat.id;

  const cryptoCurrency = checkoutSession.allowedCryptoCurrencies[0] || 'ETH';
  const fiatCurrency = checkoutSession.fiatCurrency;

  const { data: exchangeRateData } = useQuery(
    exchangeRateOptions(cryptoCurrency, fiatCurrency),
  );

  const { cryptoAmount } = calculatePaymentAmounts({
    exchangeRateData,
    fiatAmountInCents: checkoutSession.amountFiat,
    fiatCurrency,
  });

  // Generate invoiceId from checkout session ID
  const invoiceId = useMemo(() => {
    return keccak256(toHex(checkoutSession.id)) as `0x${string}`;
  }, [checkoutSession.id]);

  // Convert merchant wallet address to proper format
  const merchantAddress = useMemo(() => {
    return checkoutSession.merchantWalletAddress as `0x${string}`;
  }, [checkoutSession.merchantWalletAddress]);

  // Convert crypto amount to wei
  const paymentAmount = useMemo(() => {
    if (!cryptoAmount) return 0n;
    return parseEther(cryptoAmount.toString());
  }, [cryptoAmount]);

  // Set up contract write hook
  const {
    writeContract,
    data: hash,
    isPending: isTransactionPending,
  } = useWriteCryptoPayPayNative();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update error state when receipt error occurs
  useEffect(() => {
    if (receiptError) {
      const err =
        receiptError instanceof Error
          ? receiptError
          : new Error('Transaction failed');
      setTransactionError(err);
    }
  }, [receiptError, setTransactionError]);

  // Update payment context when transaction hash or confirmation status changes
  useEffect(() => {
    if (hash) {
      setTransactionHash(hash);
    }
  }, [hash, setTransactionHash]);

  useEffect(() => {
    if (isConfirmed) {
      setIsPaymentConfirmed(true);
    }
  }, [isConfirmed, setIsPaymentConfirmed]);

  // Handle payment
  const handlePay = () => {
    if (!writeContract || !cryptoAmount) return;

    // Ensure we're on Hardhat network
    if (!isHardhatNetwork) {
      // Automatically switch to Hardhat network
      if (switchChain) {
        switchChain({ chainId: hardhat.id });
      }
      return;
    }

    // Validate contract address
    if (
      !PAYMENT_CONTRACT_ADDRESS ||
      PAYMENT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
    ) {
      console.error(
        'Payment contract not deployed. Deploy with: cd apps/blockchain && npx hardhat ignition deploy ignition/modules/CryptoPay.ts --network localhost',
      );
      return;
    }

    // Check if user has enough balance (payment + estimated gas)
    if (balance && balance.value < paymentAmount) {
      console.error(
        `Insufficient balance. You have ${balance} ETH but need ${cryptoAmount} ETH for payment.`,
      );
      return;
    }

    try {
      setTransactionError(null);
      writeContract({
        address: PAYMENT_CONTRACT_ADDRESS as `0x${string}`,
        args: [invoiceId, merchantAddress],
        value: paymentAmount,
        chainId: hardhat.id, // Explicitly specify Hardhat chain ID
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Payment failed');
      setTransactionError(err);
      console.error('Payment error:', error);
    }
  };

  // Determine button status
  const payButtonStatus = getPayButtonStatus(
    isTransactionPending || isConfirming,
    isTransactionPending,
    isConfirming,
  );

  // Can pay if: has amount, not already processing, contract is ready, and on Hardhat network
  const canPay =
    !!cryptoAmount &&
    !isTransactionPending &&
    !isConfirming &&
    !isConfirmed &&
    !!writeContract &&
    isHardhatNetwork;

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
      {transactionError && (
        <ErrorAlert
          title="Payment Failed"
          message={transactionError.message}
          onRetry={() => {
            setTransactionError(null);
            handlePay();
          }}
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
      <PaymentStatus
        isConfirmed={isConfirmed}
        transactionError={transactionError}
        hash={hash}
        chain={chain}
      />
    </div>
  );
}
