import { mutationOptions } from '@tanstack/react-query';
import {
  type CreateWebhookSubscription,
  type UpdateWebhookSubscription,
  type WebhookSubscription,
} from '@workspace/shared';
import { apiClient } from '@/lib/api-config';

export const createWebhookOptions = mutationOptions({
  mutationFn: async (input: CreateWebhookSubscription) => {
    const response = await apiClient.post<WebhookSubscription>(
      '/webhooks/subscriptions',
      input,
    );
    return response.data;
  },
});

export const updateWebhookOptions = mutationOptions({
  mutationFn: async (data: {
    id: string;
    updates: UpdateWebhookSubscription;
  }) => {
    const response = await apiClient.patch<WebhookSubscription>(
      `/webhooks/subscriptions/${data.id}`,
      data.updates,
    );
    return response.data;
  },
});

export const deleteWebhookOptions = mutationOptions({
  mutationFn: async (id: string) => {
    await apiClient.delete(`/webhooks/subscriptions/${id}`);
  },
});
