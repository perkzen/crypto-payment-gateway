import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-config';

export interface Merchant {
  id: string;
  displayName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export const merchantOptions = queryOptions({
  queryKey: ['merchant'],
  queryFn: async (): Promise<Merchant> => {
    const response = await apiClient.get<Merchant>('/merchants');
    return response.data;
  },
});
