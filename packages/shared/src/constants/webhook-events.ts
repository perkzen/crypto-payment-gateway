/**
 * Webhook event name constants
 *
 * These constants represent the different webhook event types that can be
 * subscribed to for payment-related notifications.
 */
export const WebhookEventName = {
  PaymentCreated: 'payment.created',
  PaymentPending: 'payment.pending',
  PaymentCompleted: 'payment.completed',
  PaymentFailed: 'payment.failed',
  PaymentExpired: 'payment.expired',
} as const;

/**
 * Type representing all possible webhook event names
 */
export type WebhookEventName =
  (typeof WebhookEventName)[keyof typeof WebhookEventName];

