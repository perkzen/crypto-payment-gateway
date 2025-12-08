'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

interface PaymentContextValue {
  transactionHash: `0x${string}` | undefined;
  setTransactionHash: (hash: `0x${string}` | undefined) => void;
  isPaymentConfirmed: boolean;
  setIsPaymentConfirmed: (confirmed: boolean) => void;
}

const PaymentContext = createContext<PaymentContextValue | undefined>(
  undefined,
);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [transactionHash, setTransactionHash] = useState<
    `0x${string}` | undefined
  >(undefined);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  return (
    <PaymentContext.Provider
      value={{
        transactionHash,
        setTransactionHash,
        isPaymentConfirmed,
        setIsPaymentConfirmed,
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
