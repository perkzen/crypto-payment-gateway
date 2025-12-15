import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  BlockchainEventName,
  PaidEvent,
} from '@workspace/shared';
import { Queue } from 'bullmq';
import { BlockchainEventJobData } from '../dtos/blockchain-event-job.dto';

@Injectable()
export class BlockchainEventQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(BlockchainEventQueueService.name);

  constructor(
    @InjectQueue(QueueName.BLOCKCHAIN_EVENTS)
    private readonly queue: Queue<BlockchainEventJobData>,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  /**
   * Enqueue Paid events for processing (both native and token payments)
   */
  async enqueuePaid(events: PaidEvent[]): Promise<void> {
    await Promise.all(
      events.map((event) =>
        this.enqueue({
          eventName: BlockchainEventName.Paid,
          event,
        }),
      ),
    );
  }

  /**
   * Generic method to enqueue blockchain events
   */
  private async enqueue(jobData: BlockchainEventJobData): Promise<void> {
    try {
      await this.queue.add('process-blockchain-event', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
      this.logger.debug(
        `Enqueued ${jobData.eventName} event: ${jobData.event.checkoutSessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue ${jobData.eventName} event: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
