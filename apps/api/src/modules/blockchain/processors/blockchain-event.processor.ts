import { CheckoutSessionsService } from '@app/modules/checkout-sessions/checkout-sessions.service';
import { PaymentsService } from '@app/modules/payments/payments.service';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { WalletsService } from '@app/modules/wallets/wallets.service';
import { WebhookQueueService } from '@app/modules/webhooks/services/webhook-queue.service';
import { WebhooksService } from '@app/modules/webhooks/webhooks.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import {
  BlockchainEventName,
  PaidEvent,
  WebhookEventName,
} from '@workspace/shared';
import { extractTokenAddress } from '@workspace/shared';
import { Job } from 'bullmq';
import { BlockchainEventJobData } from '../dtos/blockchain-event-job.dto';

@Processor(QueueName.BLOCKCHAIN_EVENTS)
export class BlockchainEventProcessor extends WorkerHost {
  private readonly logger = new Logger(BlockchainEventProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly checkoutSessionsService: CheckoutSessionsService,
    private readonly walletsService: WalletsService,
    private readonly webhooksService: WebhooksService,
    private readonly webhookQueueService: WebhookQueueService,
  ) {
    super();
  }

  async process(job: Job<BlockchainEventJobData>): Promise<void> {
    const { eventName, event } = job.data;

    this.logger.log(`Processing ${eventName} event: ${JSON.stringify(event)}`);

    switch (eventName) {
      case BlockchainEventName.Paid:
        await this.handlePaymentEvent(event);
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventName}`);
    }
  }

  /**
   * Handle payment events (both native and token payments)
   * token is address(0) for native payments, token address for ERC-20 payments
   * Idempotent: if payment already exists by txHash, skip processing
   */
  private async handlePaymentEvent(event: PaidEvent): Promise<void> {
    try {
      const tokenAddress = extractTokenAddress(event.token);

      const session =
        await this.checkoutSessionsService.findCheckoutSessionByHashedId(
          event.checkoutSessionId,
        );

      if (!session) return;

      const network = session.allowedNetworks[0];

      // Check if payment already exists
      if (session.paymentId) return;

      const merchantWalletAddress =
        await this.walletsService.getWalletAddressByMerchantId(
          session.merchantId,
        );

      const payment = await this.paymentsService.createPayment(
        session.merchantId,
        {
          network,
          address: merchantWalletAddress,
          txHash: event.transactionHash,
          ...(tokenAddress && { tokenAddress }),
          paidAmount: event.grossAmount,
          blockNumber: event.blockNumber,
        },
      );

      await this.checkoutSessionsService.updateCheckoutSession(session.id, {
        paymentId: payment.id,
        completedAt: new Date(),
      });

      // Trigger webhook for payment.created event
      await this.triggerWebhook(
        session.merchantId,
        WebhookEventName.PaymentCreated,
        payment,
        session,
      );
    } catch (error) {
      this.logger.error(
        `Error handling Paid event: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
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
