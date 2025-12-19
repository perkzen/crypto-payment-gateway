import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { CheckoutSessionsService } from '@app/modules/checkout-sessions/checkout-sessions.service';
import { PaymentsService } from '@app/modules/payments/payments.service';
import { getMinConfirmationsForNetwork } from '@app/modules/payments/utils/network-confirmations';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { WebhookQueueService } from '@app/modules/webhooks/services/webhook-queue.service';
import { WebhooksService } from '@app/modules/webhooks/webhooks.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WebhookEventName } from '@workspace/shared';
import { Job } from 'bullmq';
import { type PublicClient } from 'viem';
import {
  BlockConfirmationJobData,
  BlockConfirmationJobType,
} from '../dtos/block-confirmation-job.dto';

@Processor(QueueName.BLOCK_CONFIRMATIONS)
export class BlockConfirmationProcessor extends WorkerHost {
  private readonly logger = new Logger(BlockConfirmationProcessor.name);

  constructor(
    @Blockchain()
    private readonly blockchain: PublicClient,
    private readonly paymentsService: PaymentsService,
    private readonly checkoutSessionsService: CheckoutSessionsService,
    private readonly webhooksService: WebhooksService,
    private readonly webhookQueueService: WebhookQueueService,
  ) {
    super();
  }

  async process(job: Job<BlockConfirmationJobData>): Promise<void> {
    const { jobType } = job.data;

    if (jobType !== BlockConfirmationJobType.ProcessBlock) {
      this.logger.warn(`Unknown job type: ${jobType}`);
      return;
    }

    await this.handleProcessBlock(job.data);
  }

  private async handleProcessBlock(
    data: BlockConfirmationJobData,
  ): Promise<void> {
    if (data.jobType !== BlockConfirmationJobType.ProcessBlock) {
      throw new Error('Invalid job data for ProcessBlock');
    }

    const { blockNumber } = data;
    const currentBlock = BigInt(blockNumber);

    try {
      this.logger.debug(`Processing new block: ${blockNumber}`);
      const pendingPayments = await this.paymentsService.findPendingPayments();

      if (pendingPayments.length === 0) {
        this.logger.debug(`No pending payments for block ${blockNumber}`);
        return;
      }

      this.logger.debug(
        `Processing ${pendingPayments.length} pending payment(s) for block ${blockNumber}`,
      );

      await Promise.all(
        pendingPayments.map((payment) =>
          this.processPaymentConfirmation(payment.id, {
            currentBlock,
            txHash: payment.txHash,
            transactionBlockNumber: payment.blockNumber,
            network: payment.network,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Error processing block ${blockNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async processPaymentConfirmation(
    paymentId: string,
    data: {
      currentBlock: bigint;
      txHash: string;
      transactionBlockNumber: string;
      network: string;
    },
  ): Promise<void> {
    try {
      const { currentBlock, txHash, transactionBlockNumber } = data;

      const receipt = await this.blockchain.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // If receipt doesn't exist, transaction might not be mined yet
      // Skip for now - will be checked again on next block
      if (!receipt) {
        this.logger.debug(
          `Receipt not found for payment ${paymentId}, transaction may not be mined yet`,
        );
        return;
      }

      // Check if transaction was reverted/failed
      // In viem, status is 'success' or 'reverted'
      if (receipt.status !== 'success') {
        this.logger.warn(
          `Transaction ${txHash} was reverted or failed for payment ${paymentId} (status: ${receipt.status})`,
        );
        const failedPayment = await this.paymentsService.updatePayment(
          paymentId,
          {
            status: 'failed',
          },
        );

        // Trigger webhook for payment.failed event
        await this.triggerWebhook(
          failedPayment.merchantId,
          WebhookEventName.PaymentFailed,
          failedPayment,
        );
        return;
      }

      const txBlock = BigInt(transactionBlockNumber);
      const confirmations = Math.max(0, Number(currentBlock - txBlock));

      const existingPayment =
        await this.paymentsService.findPaymentById(paymentId);

      // If payment is already failed or confirmed, skip processing
      if (existingPayment.status === 'failed') {
        this.logger.debug(
          `Payment ${paymentId} is already marked as failed, skipping`,
        );
        return;
      }

      if (existingPayment.status === 'confirmed') {
        // Still update confirmations count even if already confirmed
        await this.paymentsService.updatePayment(paymentId, {
          confirmations,
        });
        return;
      }

      const minConfirmations = getMinConfirmationsForNetwork(data.network);
      // At this point, we know status is 'pending' (we already checked for 'confirmed' and 'failed')
      const shouldConfirm = confirmations >= minConfirmations;

      const updatedPayment = await this.paymentsService.updatePayment(
        paymentId,
        {
          confirmations,
          ...(shouldConfirm ? { status: 'confirmed' } : {}),
          ...(shouldConfirm && { confirmedAt: new Date() }),
        },
      );

      // Trigger webhook for payment.completed event when payment is confirmed
      if (shouldConfirm) {
        const checkoutSession =
          await this.checkoutSessionsService.findCheckoutSessionByPaymentId(
            paymentId,
          );
        await this.triggerWebhook(
          updatedPayment.merchantId,
          WebhookEventName.PaymentCompleted,
          updatedPayment,
          checkoutSession || undefined,
        );
      }
    } catch (error) {
      // If payment not found, log and continue
      if (
        error instanceof Error &&
        error.message.includes('Payment not found')
      ) {
        this.logger.warn(
          `Payment ${paymentId} not found, may have been deleted`,
        );
        return;
      }

      this.logger.error(
        `Error processing confirmation for payment ${paymentId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - continue processing other payments
      // Consider marking as failed if it's a persistent error, but for now
      // we'll let it retry on the next block
    }
  }

  private async triggerWebhook(
    merchantId: string,
    event: WebhookEventName,
    payment: unknown,
    checkoutSession?: unknown,
  ): Promise<void> {
    try {
      const subscriptions =
        await this.webhooksService.findActiveSubscriptionsByMerchantIdAndEvent(
          merchantId,
          event,
        );

      if (subscriptions.length === 0) {
        return;
      }

      await Promise.all(
        subscriptions.map((subscription) =>
          this.webhookQueueService.enqueueWebhookDelivery({
            subscriptionId: subscription.id,
            url: subscription.url,
            event,
            payload: {
              payment,
              ...(checkoutSession && { checkoutSession }),
            },
            secret: subscription.secret,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to trigger webhook for merchant ${merchantId}, event ${event}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      // Don't throw - webhook failures shouldn't break payment processing
    }
  }
}
