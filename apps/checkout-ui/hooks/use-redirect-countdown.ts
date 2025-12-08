import { useEffect, useState } from 'react';
import type { PublicCheckoutSession } from '@workspace/shared';

type PaymentStatus = 'completed' | 'expired' | 'open';

interface UseRedirectCountdownProps {
  status: PaymentStatus;
  checkoutSession: PublicCheckoutSession;
  initialSeconds?: number;
}

export function useRedirectCountdown({
  status,
  checkoutSession,
  initialSeconds = 5,
}: UseRedirectCountdownProps) {
  const [redirectCountdown, setRedirectCountdown] = useState(initialSeconds);
  const shouldShowRedirect =
    (status === 'completed' && checkoutSession.successUrl) ||
    (status === 'expired' && checkoutSession.cancelUrl);

  // Reset countdown when redirect should be shown
  useEffect(() => {
    if (shouldShowRedirect) {
      setRedirectCountdown(initialSeconds);
    }
  }, [shouldShowRedirect, initialSeconds]);

  // Create interval only when shouldShowRedirect changes
  useEffect(() => {
    if (!shouldShowRedirect) {
      return;
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldShowRedirect]);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (shouldShowRedirect && redirectCountdown === 0) {
      if (status === 'completed' && checkoutSession.successUrl) {
        window.location.href = checkoutSession.successUrl;
      } else if (status === 'expired' && checkoutSession.cancelUrl) {
        window.location.href = checkoutSession.cancelUrl;
      }
    }
  }, [shouldShowRedirect, redirectCountdown, status, checkoutSession]);

  return {
    redirectCountdown,
    shouldShowRedirect,
  };
}
