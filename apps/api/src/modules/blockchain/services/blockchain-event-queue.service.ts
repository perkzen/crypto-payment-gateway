import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  BlockchainEventName,
  PaidNativeEvent,
  PaidTokenEvent,
} from '@workspace/shared';
import { Queue } from 'bullmq';
import { BlockchainEventJobData } from '../dtos/blockchain-event-job.dto';

@Injectable()
export class BlockchainEventQueueService {
  private readonly logger = new Logger(BlockchainEventQueueService.name);

  constructor(
    @InjectQueue(QueueName.BLOCKCHAIN_EVENTS)
    private readonly queue: Queue<BlockchainEventJobData>,
  ) {}

  /**
   * Enqueue PaidNative events for processing
   */
  async enqueuePaidNative(events: PaidNativeEvent[]): Promise<void> {
    await Promise.all(
      events.map((event) =>
        this.enqueue({
          eventName: BlockchainEventName.PaidNative,
          event,
        }),
      ),
    );
  }

  /**
   * Enqueue PaidToken events for processing
   */
  async enqueuePaidToken(events: PaidTokenEvent[]): Promise<void> {
    await Promise.all(
      events.map((event) =>
        this.enqueue({
          eventName: BlockchainEventName.PaidToken,
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
        `Enqueued ${jobData.eventName} event: ${jobData.event.invoiceId}`,
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
