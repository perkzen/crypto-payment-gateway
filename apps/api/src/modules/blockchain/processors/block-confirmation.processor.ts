import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { PaymentsService } from '@app/modules/payments/payments.service';
import { getMinConfirmationsForNetwork } from '@app/modules/payments/utils/network-confirmations';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
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
  ) {
    super();
  }

  async process(job: Job<BlockConfirmationJobData>): Promise<void> {
    const {
      jobType,
      paymentId,
      currentBlockNumber,
      txHash,
      transactionBlockNumber,
    } = job.data;

    this.logger.log(
      `Processing confirmation for payment ${paymentId} at block ${currentBlockNumber}`,
    );

    switch (jobType) {
      case BlockConfirmationJobType.ProcessConfirmation:
        await this.handleBlockConfirmation({
          paymentId,
          currentBlockNumber,
          txHash,
          transactionBlockNumber,
        });
        break;
      default:
        this.logger.warn(`Unknown job type: ${jobType}`);
    }
  }

  private async handleBlockConfirmation(
    data: Omit<BlockConfirmationJobData, 'jobType'>,
  ): Promise<void> {
    try {
      const { paymentId, currentBlockNumber, txHash, transactionBlockNumber } =
        data;

      const receipt = await this.blockchain.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (!receipt) return;

      const currentBlock = BigInt(currentBlockNumber);
      const txBlock = BigInt(transactionBlockNumber);
      const confirmations = Math.max(0, Number(currentBlock - txBlock));

      const existingPayment =
        await this.paymentsService.findPaymentById(paymentId);

      const minConfirmations = getMinConfirmationsForNetwork(
        existingPayment.network,
      );
      const shouldConfirm = confirmations >= minConfirmations;
      const isNewlyConfirmed =
        shouldConfirm && existingPayment.status !== 'confirmed';

      await this.paymentsService.updatePayment(paymentId, {
        confirmations,
        ...(isNewlyConfirmed ? { status: 'confirmed' } : {}),
        ...(isNewlyConfirmed && { confirmedAt: new Date() }),
      });
    } catch (error) {
      this.logger.error(
        `Error processing confirmation: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
