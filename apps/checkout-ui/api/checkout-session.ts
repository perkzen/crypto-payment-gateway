import { queryOptions } from '@tanstack/react-query';
import {
  PublicCheckoutSessionSchema,
} from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function checkoutSessionByIdOptions(sessionId: string) {
  return queryOptions({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      const client = getCryptoPayClient();
      const response = await client.get(`/checkout/sessions/${sessionId}`);
      return PublicCheckoutSessionSchema.parse(response.data);
    },
    enabled: !!sessionId,
  });
}
