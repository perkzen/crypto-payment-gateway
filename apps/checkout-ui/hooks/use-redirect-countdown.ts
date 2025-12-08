import { useEffect, useState } from 'react';
import type { PublicCheckoutSession } from '@workspace/shared';

type PaymentStatus = 'completed' | 'expired' | 'canceled' | 'open';

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
    ((status === 'canceled' || status === 'expired') &&
      checkoutSession.cancelUrl);

  useEffect(() => {
    if (shouldShowRedirect && redirectCountdown > 0) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [shouldShowRedirect, redirectCountdown]);

  // Handle redirect when countdown reaches 0
  useEffect(() => {
    if (shouldShowRedirect && redirectCountdown === 0) {
      if (status === 'completed' && checkoutSession.successUrl) {
        window.location.href = checkoutSession.successUrl;
      } else if (
        (status === 'canceled' || status === 'expired') &&
        checkoutSession.cancelUrl
      ) {
        window.location.href = checkoutSession.cancelUrl;
      }
    }
  }, [shouldShowRedirect, redirectCountdown, status, checkoutSession]);

  return {
    redirectCountdown,
    shouldShowRedirect,
  };
}

