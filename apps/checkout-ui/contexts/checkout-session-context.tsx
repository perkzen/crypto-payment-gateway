'use client';

import { type ReactNode, createContext, useContext } from 'react';
import type { PublicCheckoutSession } from '@workspace/shared';

interface CheckoutSessionContextValue {
  checkoutSession: PublicCheckoutSession;
}

const CheckoutSessionContext = createContext<
  CheckoutSessionContextValue | undefined
>(undefined);

interface CheckoutSessionProviderProps {
  children: ReactNode;
  checkoutSession: PublicCheckoutSession | undefined;
}

export function CheckoutSessionProvider({
  children,
  checkoutSession,
}: CheckoutSessionProviderProps) {
  if (!checkoutSession) return null;

  return (
    <CheckoutSessionContext.Provider value={{ checkoutSession }}>
      {children}
    </CheckoutSessionContext.Provider>
  );
}

export function useCheckoutSession(): PublicCheckoutSession {
  const context = useContext(CheckoutSessionContext);
  if (context === undefined) {
    throw new Error(
      'useCheckoutSession must be used within a CheckoutSessionProvider',
    );
  }
  return context.checkoutSession;
}
