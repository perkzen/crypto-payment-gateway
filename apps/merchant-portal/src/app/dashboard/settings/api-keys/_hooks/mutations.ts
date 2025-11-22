import { mutationOptions } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

export const createApiKeyOptions = mutationOptions({
  mutationFn: async (input: { name: string }) => {
    const { data, error } = await authClient.apiKey.create(input);

    if (error) throw error;

    return data;
  },
});

export const deleteApiKeyOptions = mutationOptions({
  mutationFn: async (data: { keyId: string }) => authClient.apiKey.delete(data),
});

export const updateApiKeyOptions = mutationOptions({
  mutationFn: async (data: { keyId: string; name: string }) =>
    authClient.apiKey.update(data),
});
