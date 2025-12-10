import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { PaidNativeEvent, PaidTokenEvent } from '@workspace/shared';
import { Job } from 'bullmq';
import { BlockchainEventJobData } from '../dtos/blockchain-event-job.dto';

@Processor(QueueName.BLOCKCHAIN_EVENTS)
export class BlockchainEventProcessor extends WorkerHost {
  private readonly logger = new Logger(BlockchainEventProcessor.name);

  async process(job: Job<BlockchainEventJobData>): Promise<void> {
    const { eventName, event } = job.data;

    this.logger.log(`Processing ${eventName} event: ${JSON.stringify(event)}`);

    // TODO: Implement event processing logic
    // - Find associated payment/checkout session
    // - Update payment status
    // - Trigger webhooks if needed
    // - Handle errors appropriately

    switch (eventName) {
      case 'PaidNative':
        await this.handlePaidNative(event as PaidNativeEvent);
        break;
      case 'PaidToken':
        await this.handlePaidToken(event as PaidTokenEvent);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventName}`);
    }
  }

  private async handlePaidNative(event: PaidNativeEvent): Promise<void> {
    // TODO: Implement PaidNative event handling
    // - Find payment by invoiceId
    // - Update payment status and transaction hash
    // - Update checkout session if needed
    // - Trigger webhooks
    this.logger.debug('Handling PaidNative event', event);
  }

  private async handlePaidToken(event: PaidTokenEvent): Promise<void> {
    // TODO: Implement PaidToken event handling
    // - Find payment by invoiceId
    // - Update payment status and transaction hash
    // - Update checkout session if needed
    // - Trigger webhooks
    this.logger.debug('Handling PaidToken event', event);
  }
}
