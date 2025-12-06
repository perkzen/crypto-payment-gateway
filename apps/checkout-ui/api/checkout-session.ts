import { queryOptions } from '@tanstack/react-query';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function checkoutSessionByIdOptions(sessionId: string) {
  return queryOptions({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      const client = getCryptoPayClient();
      return client.getCheckoutSessionById(sessionId);
    },
    enabled: !!sessionId,
  });
}
