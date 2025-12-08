import { mutationOptions } from '@tanstack/react-query';
import type { CreateCheckoutSession } from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function checkoutSessionOptions() {
  return mutationOptions({
    mutationFn: async (data: CreateCheckoutSession & { apiKey?: string }) => {
      const { apiKey, ...checkoutSessionData } = data;
      const client = getCryptoPayClient(apiKey);
      return client.createCheckoutSession(checkoutSessionData);
    },
  });
}

