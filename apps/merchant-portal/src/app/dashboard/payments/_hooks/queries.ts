import { queryOptions } from '@tanstack/react-query';
import {
  type GetPaymentsQuery,
  type PaginatedPaymentsResponse,
} from '@workspace/shared';
import { apiClient } from '@/lib/api-config';

export function listPaymentsOptions(query?: Partial<GetPaymentsQuery>) {
  return queryOptions({
    queryKey: ['payments', query],
    queryFn: async (): Promise<PaginatedPaymentsResponse> => {
      const response = await apiClient.get<PaginatedPaymentsResponse>(
        '/payments',
        {
          params: query,
        },
      );
      return response.data;
    },
  });
}
