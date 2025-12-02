'use client';

import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { parseEther } from 'viem';
import { useEffect, useState } from 'react';
import type { PublicCheckoutSession } from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';
import { calculateCryptoAmount } from '@workspace/shared';
import { ConnectWalletButton } from './payment/connect-wallet-button';
import { WalletInfo } from './payment/wallet-info';
import { PayButton } from './payment/pay-button';
import { PaymentStatus } from './payment/payment-status';

interface PaymentActionsProps {
  checkoutSession: PublicCheckoutSession;
  exchangeRate: number;
  onPaymentSuccess?: () => void;
}

export function PaymentActions({
  checkoutSession,
  exchangeRate,
  onPaymentSuccess,
}: PaymentActionsProps) {
  const { address, isConnected, chain } = useAccount();
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Convert checkout session ID to bytes32 for invoiceId
  const getInvoiceId = (sessionId: string): `0x${string}` => {
    // Remove dashes and pad to 64 hex characters (32 bytes)
    const hex = sessionId.replace(/-/g, '');
    return `0x${hex.padStart(64, '0').slice(0, 64)}` as `0x${string}`;
  };

  // Calculate crypto amount using exchange rate from props
  const getCryptoAmount = () => {
    return calculateCryptoAmount(checkoutSession.amountFiat, exchangeRate);
  };

  const {
    writeContract,
    data: hash,
    isPending: isTransactionPending,
    error: transactionError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed && invoiceId) {
      // Payment confirmed, notify parent component
      onPaymentSuccess?.();
    }
  }, [isConfirmed, invoiceId, onPaymentSuccess]);

  const handlePay = async () => {
    if (!isConnected || !address) {
      return;
    }

    setIsCreatingPayment(true);
    try {
      // TODO: Call API to create payment
      // POST /checkout/sessions/{id}/payments
      // This should return: paymentId, contractAddress, amount, invoiceId
      const client = getCryptoPayClient();

      // For now, we'll use the session ID as invoiceId
      const sessionInvoiceId = getInvoiceId(checkoutSession.id);
      setInvoiceId(sessionInvoiceId);

      // Calculate amount in ETH
      const ethAmount = getCryptoAmount();
      const amountInWei = parseEther(ethAmount.toFixed(18));
      setPaymentAmount(amountInWei.toString());
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const isLoading = isCreatingPayment || isTransactionPending || isConfirming;
  const canPay = isConnected && !isLoading && checkoutSession.status === 'open';
  const cryptoAmount = getCryptoAmount();

  // Show connect button if wallet not connected
  if (!isConnected) {
    return <ConnectWalletButton />;
  }

  // Show success status if payment confirmed
  if (isConfirmed) {
    return (
      <PaymentStatus
        isConfirmed={isConfirmed}
        transactionError={transactionError}
        hash={hash}
        chain={chain}
      />
    );
  }

  // Show payment interface when wallet is connected
  return (
    <div className="flex flex-col items-center gap-4">
      <WalletInfo />
      <PaymentStatus
        isConfirmed={false}
        transactionError={transactionError}
        hash={hash}
        chain={chain}
      />
      <PayButton
        checkoutSession={checkoutSession}
        onPay={handlePay}
        isLoading={isLoading}
        isTransactionPending={isTransactionPending}
        isConfirming={isConfirming}
        canPay={canPay}
        cryptoAmount={cryptoAmount}
      />
    </div>
  );
}
