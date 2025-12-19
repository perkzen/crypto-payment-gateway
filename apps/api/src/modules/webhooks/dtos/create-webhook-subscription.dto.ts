import {
  CreateWebhookSubscriptionSchema,
} from '@workspace/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateWebhookSubscriptionDto extends createZodDto(
  CreateWebhookSubscriptionSchema,
) {}
