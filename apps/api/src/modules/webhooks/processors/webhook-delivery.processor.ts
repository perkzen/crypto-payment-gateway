import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WebhookEventName } from '@workspace/shared';
import { Job } from 'bullmq';
import { WebhookDeliveryJobData } from '../dtos/webhook-delivery-job.dto';
import { WebhookDeliveryService } from '../services/webhook-delivery.service';

@Processor(QueueName.WEBHOOK_DELIVERY)
export class WebhookDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);

  constructor(
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {
    super();
  }

  async process(job: Job<WebhookDeliveryJobData>): Promise<void> {
    const { subscriptionId, url, event, payload, secret } = job.data;

    this.logger.log(
      `Processing webhook delivery for subscription ${subscriptionId}, event: ${event}`,
    );

    try {
      const webhookPayload = {
        id: `${subscriptionId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: event,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      await this.webhookDeliveryService.deliverWebhook(
        url,
        webhookPayload,
        secret,
      );

      this.logger.log(
        `Successfully delivered webhook for subscription ${subscriptionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to deliver webhook for subscription ${subscriptionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
