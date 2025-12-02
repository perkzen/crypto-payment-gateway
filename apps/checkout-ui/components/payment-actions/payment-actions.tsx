'use client';

import { useAccount } from 'wagmi';
import type { PublicCheckoutSession } from '@workspace/shared';
import { ConnectWalletButton } from '@/components/payment-actions/connect-wallet-button';
import { PayButton } from '@/components/payment-actions/pay-button';
import { PaymentStatus } from '@/components/payment-actions/payment-status';
import { WalletInfo } from '@/components/payment-actions/wallet-info';

interface PaymentActionsProps {
  checkoutSession: PublicCheckoutSession;
  exchangeRate: number;
  onPaymentSuccess?: () => void;
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
  const canPay = isConnected && checkoutSession.status === 'open';

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
        isLoading={isLoading}
        isTransactionPending={isTransactionPending}
        isConfirming={isConfirming}
        canPay={canPay}
        cryptoAmount={cryptoAmount}
      />
    </div>
  );
}
