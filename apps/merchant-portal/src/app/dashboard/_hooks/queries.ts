import { queryOptions } from '@tanstack/react-query';
import { type MerchantStats } from '@workspace/shared';
import { apiClient } from '@/lib/api-config';

export const merchantStatsOptions = queryOptions({
  queryKey: ['merchant-stats'],
  queryFn: async (): Promise<MerchantStats> => {
    const response = await apiClient.get<MerchantStats>('/merchants/stats');
    return response.data;
  },
});
