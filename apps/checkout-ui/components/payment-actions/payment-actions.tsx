'use client';

import { useAccount } from 'wagmi';
import type { ExchangeRate, PublicCheckoutSession } from '@workspace/shared';
import { ConnectWalletButton } from '@/components/payment-actions/connect-wallet-button';
import {
  PayButton,
  type PayButtonStatus,
} from '@/components/payment-actions/pay-button';
import { PaymentStatus } from '@/components/payment-actions/payment-status';
import { WalletInfo } from '@/components/payment-actions/wallet-info';

interface PaymentActionsProps {
  checkoutSession: PublicCheckoutSession;
  exchangeRate: ExchangeRate | null;
  onPaymentSuccess?: () => void;
}

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

function getSessionStatus(expiresAt: Date): 'open' | 'expired' {
  const now = new Date();
  if (now >= expiresAt) {
    return 'expired';
  }
  return 'open';
}

export function PaymentActions({ checkoutSession }: PaymentActionsProps) {
  const { isConnected, chain } = useAccount();

  // Placeholder values - logic will be implemented later
  const isLoading = false;
  const isTransactionPending = false;
  const isConfirming = false;
  const isConfirmed = false;
  const transactionError: Error | null = null;
  const hash: `0x${string}` | undefined = undefined;
  const cryptoAmount = 0.001; // Placeholder
  const sessionStatus = getSessionStatus(new Date(checkoutSession.expiresAt));
  const canPay = isConnected && sessionStatus === 'open';
  const payButtonStatus = getPayButtonStatus(
    isLoading,
    isTransactionPending,
    isConfirming,
  );

  const handlePay = () => {
    // TODO: Implement payment logic
    console.log('Pay clicked');
  };

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
        status={payButtonStatus}
        canPay={canPay}
        cryptoAmount={cryptoAmount}
      />
    </div>
  );
}
