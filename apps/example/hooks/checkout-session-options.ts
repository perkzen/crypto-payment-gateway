import { mutationOptions } from '@tanstack/react-query';
import {
  type CreateCheckoutSession,
  CreateCheckoutSessionResultSchema,
} from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function checkoutSessionOptions() {
  return mutationOptions({
    mutationFn: async (data: CreateCheckoutSession & { apiKey?: string }) => {
      const { apiKey, ...checkoutSessionData } = data;
      const client = getCryptoPayClient(apiKey);
      const response = await client.post('/checkout/sessions', checkoutSessionData);
      return CreateCheckoutSessionResultSchema.parse(response.data);
    },
  });
}

