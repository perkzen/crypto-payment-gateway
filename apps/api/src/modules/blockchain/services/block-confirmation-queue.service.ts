import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BlockConfirmationJobData } from '../dtos/block-confirmation-job.dto';

@Injectable()
export class BlockConfirmationQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(BlockConfirmationQueueService.name);

  constructor(
    @InjectQueue(QueueName.BLOCK_CONFIRMATIONS)
    private readonly queue: Queue<BlockConfirmationJobData>,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  /**
   * Enqueue a payment confirmation job
   */
  async enqueueConfirmation(jobData: BlockConfirmationJobData): Promise<void> {
    try {
      await this.queue.add('process-block-confirmation', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        jobId: `confirmation-${jobData.paymentId}-${jobData.currentBlockNumber}`,
      });
      this.logger.debug(
        `Enqueued confirmation job for payment ${jobData.paymentId} at block ${jobData.currentBlockNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue confirmation job for payment ${jobData.paymentId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Enqueue multiple payment confirmation jobs
   */
  async enqueueConfirmations(
    jobDataArray: BlockConfirmationJobData[],
  ): Promise<void> {
    await Promise.all(
      jobDataArray.map((jobData) => this.enqueueConfirmation(jobData)),
    );
  }
}
