import { queryOptions } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

export const listApiKeysOptions = queryOptions({
  queryKey: ['api-keys'],
  queryFn: async () => {
    const { data, error } = await authClient.apiKey.list();

    if (error) throw error;

    return data;
  },
});
