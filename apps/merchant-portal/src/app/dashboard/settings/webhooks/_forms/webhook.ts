import { formOptions } from '@tanstack/react-form';
import { WebhookEventName } from '@workspace/shared';
import { z } from 'zod';

const webhookEventNameEnum = z.enum([
  WebhookEventName.PaymentCreated,
  WebhookEventName.PaymentCompleted,
  WebhookEventName.PaymentFailed,
]);

const webhookSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  events: z
    .array(webhookEventNameEnum)
    .min(1, 'Please select at least one event'),
  secret: z.string().optional(),
});

export type WebhookFormValues = z.input<typeof webhookSchema>;

const defaultValues: WebhookFormValues = {
  url: '',
  events: [],
};

export const webhookFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: webhookSchema,
  },
});
