import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import {
  type GetPaymentsQuery,
  type PaginatedPaymentsResponse,
} from '@workspace/shared';

const API_BASE_URL = 'http://localhost:8000';

export function listPaymentsOptions(query?: Partial<GetPaymentsQuery>) {
  return queryOptions({
    queryKey: ['payments', query],
    queryFn: async (): Promise<PaginatedPaymentsResponse> => {
      const response = await axios.get<PaginatedPaymentsResponse>(
        `${API_BASE_URL}/payments`,
        {
          params: query,
          withCredentials: true,
        },
      );
      return response.data;
    },
  });
}
