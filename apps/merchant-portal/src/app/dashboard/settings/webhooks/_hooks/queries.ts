import { queryOptions } from '@tanstack/react-query';
import { type WebhookSubscription } from '@workspace/shared';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const listWebhooksOptions = queryOptions({
  queryKey: ['webhooks'],
  queryFn: async (): Promise<WebhookSubscription[]> => {
    const response = await axios.get<WebhookSubscription[]>(
      `${API_BASE_URL}/webhooks/subscriptions`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
});
