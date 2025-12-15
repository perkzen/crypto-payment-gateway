'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import type { PublicCheckoutSession } from '@workspace/shared';

export type PaymentStatusType = 'completed' | 'expired' | 'open';

interface PaymentContextValue {
  transactionHash: `0x${string}` | undefined;
  setTransactionHash: (hash: `0x${string}` | undefined) => void;
  isPaymentConfirmed: boolean;
  setIsPaymentConfirmed: (confirmed: boolean) => void;
  transactionError: Error | null;
  setTransactionError: (error: Error | null) => void;
  getPaymentStatus: (session: PublicCheckoutSession) => PaymentStatusType;
}

const PaymentContext = createContext<PaymentContextValue | undefined>(
  undefined,
);

interface PaymentProviderProps {
  children: ReactNode;
}

function getPaymentStatus(
  session: PublicCheckoutSession,
  isPaymentConfirmed: boolean,
): PaymentStatusType {
  // Check if session is completed (source of truth from backend)
  if (session.completedAt !== null) {
    return 'completed';
  }

  // Fallback to frontend confirmation state for optimistic UI updates
  if (isPaymentConfirmed) {
    return 'completed';
  }

  // Check if session is expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  if (now >= expiresAt) {
    return 'expired';
  }

  return 'open';
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [transactionError, setTransactionError] = useState<Error | null>(null);

  const getPaymentStatusForSession = (session: PublicCheckoutSession) => {
    return getPaymentStatus(session, isPaymentConfirmed);
  };

  return (
    <PaymentContext.Provider
      value={{
        transactionHash,
        setTransactionHash,
        isPaymentConfirmed,
        setIsPaymentConfirmed,
        transactionError,
        setTransactionError,
        getPaymentStatus: getPaymentStatusForSession,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
