import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { WebhookDeliveryJobData } from '../dtos/webhook-delivery-job.dto';

@Injectable()
export class WebhookQueueService {
  private readonly logger = new Logger(WebhookQueueService.name);

  constructor(
    @InjectQueue(QueueName.WEBHOOK_DELIVERY)
    private readonly queue: Queue<WebhookDeliveryJobData>,
  ) {}

  async enqueueWebhookDelivery(jobData: WebhookDeliveryJobData): Promise<void> {
    try {
      await this.queue.add('deliver-webhook', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
      this.logger.debug(
        `Enqueued webhook delivery for subscription ${jobData.subscriptionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue webhook delivery: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
