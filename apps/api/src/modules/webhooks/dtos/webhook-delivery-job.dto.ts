import { WebhookEventName } from '@workspace/shared';

export interface WebhookDeliveryJobData {
  subscriptionId: string;
  url: string;
  event: WebhookEventName;
  payload: {
    payment: unknown;
    checkoutSession?: unknown;
  };
  secret?: string | null;
}
