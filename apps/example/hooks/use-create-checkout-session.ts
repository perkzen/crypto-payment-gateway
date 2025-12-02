import { mutationOptions } from '@tanstack/react-query';
import type { CreateCheckoutSession } from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function useCreateCheckoutSessionOptions(apiKey?: string) {
  return mutationOptions({
    mutationFn: async (data: CreateCheckoutSession) => {
      const client = getCryptoPayClient(apiKey);
      return client.createCheckoutSession(data);
    },
  });
}

