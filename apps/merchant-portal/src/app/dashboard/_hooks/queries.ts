import { queryOptions } from '@tanstack/react-query';
import { type MerchantStats } from '@workspace/shared';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const merchantStatsOptions = queryOptions({
  queryKey: ['merchant-stats'],
  queryFn: async (): Promise<MerchantStats> => {
    const response = await axios.get<MerchantStats>(
      `${API_BASE_URL}/merchants/stats`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
});
