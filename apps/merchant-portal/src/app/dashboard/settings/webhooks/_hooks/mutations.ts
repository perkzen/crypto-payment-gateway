import { mutationOptions } from '@tanstack/react-query';
import {
  type CreateWebhookSubscription,
  type UpdateWebhookSubscription,
  type WebhookSubscription,
} from '@workspace/shared';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const createWebhookOptions = mutationOptions({
  mutationFn: async (input: CreateWebhookSubscription) => {
    const response = await axios.post<WebhookSubscription>(
      `${API_BASE_URL}/webhooks/subscriptions`,
      input,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
});

export const updateWebhookOptions = mutationOptions({
  mutationFn: async (data: {
    id: string;
    updates: UpdateWebhookSubscription;
  }) => {
    const response = await axios.patch<WebhookSubscription>(
      `${API_BASE_URL}/webhooks/subscriptions/${data.id}`,
      data.updates,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },
});

export const deleteWebhookOptions = mutationOptions({
  mutationFn: async (id: string) => {
    await axios.delete(`${API_BASE_URL}/webhooks/subscriptions/${id}`, {
      withCredentials: true,
    });
  },
});
