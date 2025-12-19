import { queryOptions } from '@tanstack/react-query';
import { ExchangeRateSchema } from '@workspace/shared';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function exchangeRateOptions(crypto: string, fiat: string) {
  return queryOptions({
    queryKey: ['exchange-rate', crypto, fiat],
    queryFn: async () => {
      const client = getCryptoPayClient();
      const response = await client.get('/exchange/price', {
        params: {
          pair: `${crypto},${fiat}`,
        },
      });
      return ExchangeRateSchema.parse(response.data);
    },
    enabled: !!crypto && !!fiat,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Always consider data stale to ensure fresh rates
  });
}
