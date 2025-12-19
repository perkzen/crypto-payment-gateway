import { NotFoundException } from '@nestjs/common';

export class WebhookSubscriptionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Webhook subscription with id ${id} not found`);
  }
}
