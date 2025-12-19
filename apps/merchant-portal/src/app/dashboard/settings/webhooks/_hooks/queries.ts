import { queryOptions } from '@tanstack/react-query';
import { type WebhookSubscription } from '@workspace/shared';
import { apiClient } from '@/lib/api-config';

export const listWebhooksOptions = queryOptions({
  queryKey: ['webhooks'],
  queryFn: async (): Promise<WebhookSubscription[]> => {
    const response = await apiClient.get<WebhookSubscription[]>(
      '/webhooks/subscriptions',
    );
    return response.data;
  },
});
