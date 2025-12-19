import {
  WebhookSubscriptionSchema,
} from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class WebhookSubscriptionDto extends createZodDto(
  WebhookSubscriptionSchema,
) {}
