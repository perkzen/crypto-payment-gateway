'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from '@workspace/ui/components/button';
import { useState, useEffect } from 'react';
import { Loader2, Wallet, Check } from 'lucide-react';
import Image from 'next/image';
import type { PublicCheckoutSession } from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';
import { calculateCryptoAmount } from '@/lib/utils';

const ETHEREUM_ICON_URL =
  'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040';

// TODO: This should come from environment variables or API config
const PAYMENT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0x0000000000000000000000000000000000000000';

interface PaymentActionsProps {
  checkoutSession: PublicCheckoutSession;
  exchangeRate: number;
  onPaymentSuccess?: () => void;
}

// ==========================
// Sub-components
// ==========================

interface ConnectWalletButtonProps {
  onConnect?: () => void;
}

function ConnectWalletButton({ onConnect }: ConnectWalletButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => {
          const ready = mounted;

          return (
            <Button
              onClick={() => {
                openConnectModal();
                onConnect?.();
              }}
              disabled={!ready}
              size="lg"
              className="w-full"
            >
              <Image
                src={ETHEREUM_ICON_URL}
                alt="Ethereum"
                width={16}
                height={16}
                className="mr-2"
              />
              <span>Connect Wallet</span>
            </Button>
          );
        }}
      </ConnectButton.Custom>
      <p className="text-sm text-muted-foreground text-center">
        Connect your wallet to proceed with payment
      </p>
    </div>
  );
}

function WalletInfo() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) return null;

        return (
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card w-full">
            <div className="flex items-center gap-2">
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    overflow: 'hidden',
                    marginRight: 4,
                  }}
                >
                  {chain.iconUrl && (
                    <Image
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      width={20}
                      height={20}
                    />
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {account.displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {chain.name}
                </span>
              </div>
            </div>
            <Button
              onClick={openAccountModal}
              variant="ghost"
              size="sm"
            >
              Manage
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

interface PayButtonProps {
  checkoutSession: PublicCheckoutSession;
  onPay: () => void;
  isLoading: boolean;
  isTransactionPending: boolean;
  isConfirming: boolean;
  canPay: boolean;
  cryptoAmount: number;
}

function PayButton({
  onPay,
  isLoading,
  isTransactionPending,
  isConfirming,
  canPay,
  cryptoAmount,
}: PayButtonProps) {
  return (
    <Button
      onClick={onPay}
      disabled={!canPay}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isTransactionPending
            ? 'Waiting for confirmation...'
            : isConfirming
              ? 'Confirming...'
              : 'Processing...'}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Pay {cryptoAmount.toFixed(6)} ETH
        </>
      )}
    </Button>
  );
}

interface PaymentStatusProps {
  isConfirmed: boolean;
  transactionError: Error | null;
  hash: `0x${string}` | undefined;
  chain: ReturnType<typeof useAccount>['chain'];
}

function PaymentStatus({
  isConfirmed,
  transactionError,
  hash,
  chain,
}: PaymentStatusProps) {
  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-emerald-500/10 p-3">
          <Check className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Payment confirmed!
        </p>
      </div>
    );
  }

  return (
    <>
      {transactionError && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center">
          {transactionError.message || 'Transaction failed'}
        </div>
      )}

      {hash && (
        <a
          href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          View transaction on {chain?.blockExplorers?.default?.name || 'Explorer'}
        </a>
      )}
    </>
  );
}

// ==========================
// Main Component
// ==========================

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

      // Send transaction to smart contract
      writeContract({
        address: PAYMENT_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'payNative',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'invoiceId', type: 'bytes32' },
              { name: 'merchant', type: 'address' },
            ],
            outputs: [],
          },
        ],
        functionName: 'payNative',
        args: [sessionInvoiceId, MERCHANT_ADDRESS as `0x${string}`],
        value: amountInWei,
      });
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
