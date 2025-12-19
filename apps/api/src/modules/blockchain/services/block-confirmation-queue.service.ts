import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  BlockConfirmationJobData,
  BlockConfirmationJobType,
} from '../dtos/block-confirmation-job.dto';

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
    if (jobData.jobType !== BlockConfirmationJobType.ProcessConfirmation) {
      throw new Error(
        'enqueueConfirmation can only be used for ProcessConfirmation jobs',
      );
    }

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

  /**
   * Enqueue a block processing job
   */
  async enqueueBlockProcessing(blockNumber: bigint): Promise<void> {
    try {
      await this.queue.add(
        'process-block',
        {
          jobType: BlockConfirmationJobType.ProcessBlock,
          blockNumber: blockNumber.toString(),
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          jobId: `block-${blockNumber.toString()}`,
        },
      );
      this.logger.debug(`Enqueued block processing job for block ${blockNumber}`);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue block processing job for block ${blockNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
