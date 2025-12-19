import {
  UpdateWebhookSubscriptionSchema,
} from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class UpdateWebhookSubscriptionDto extends createZodDto(
  UpdateWebhookSubscriptionSchema,
) {}
