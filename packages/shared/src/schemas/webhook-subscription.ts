import { z } from 'zod';
import { WebhookEventName } from '../constants/webhook-events';

const webhookEventNameEnum = z.enum([
  WebhookEventName.PaymentCreated,
  WebhookEventName.PaymentCompleted,
  WebhookEventName.PaymentFailed,
]);

export const CreateWebhookSubscriptionSchema = z.object({
  url: z
    .string()
    .url()
    .describe('The webhook endpoint URL to receive payment notifications'),
  events: z
    .array(webhookEventNameEnum)
    .min(1)
    .describe('Array of webhook event types to subscribe to'),
  secret: z
    .string()
    .optional()
    .describe(
      'Optional secret for webhook signature verification (HMAC-SHA256)',
    ),
});

export type CreateWebhookSubscription = z.infer<
  typeof CreateWebhookSubscriptionSchema
>;

export const UpdateWebhookSubscriptionSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(webhookEventNameEnum).min(1).optional(),
  isActive: z.boolean().optional(),
  secret: z.string().optional(),
});

export type UpdateWebhookSubscription = z.infer<
  typeof UpdateWebhookSubscriptionSchema
>;

export const WebhookSubscriptionSchema = z.object({
  id: z.string().uuid(),
  merchantId: z.string().uuid(),
  url: z.string().url(),
  events: z.array(webhookEventNameEnum),
  secret: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebhookSubscription = z.infer<typeof WebhookSubscriptionSchema>;
