import { queryOptions } from '@tanstack/react-query';
import { getCryptoPayClient } from '@/lib/crypto-pay-client';

export function useExchangeRateOptions(crypto: string, fiat: string) {
  return queryOptions({
    queryKey: ['exchange-rate', crypto, fiat],
    queryFn: async () => {
      const client = getCryptoPayClient();
      return client.getExchangeRate(crypto, fiat);
    },
    enabled: !!crypto && !!fiat,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0, // Always consider data stale to ensure fresh rates
  });
}
