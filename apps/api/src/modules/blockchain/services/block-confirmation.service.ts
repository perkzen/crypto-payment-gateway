import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { PaymentsService } from '@app/modules/payments/payments.service';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type PublicClient } from 'viem';
import { BlockConfirmationJobType } from '../dtos/block-confirmation-job.dto';
import { BlockConfirmationQueueService } from './block-confirmation-queue.service';

@Injectable()
export class BlockConfirmationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockConfirmationService.name);
  private unwatchBlockNumber: (() => void) | null = null;

  constructor(
    @Blockchain()
    private readonly blockchain: PublicClient,
    private readonly paymentsService: PaymentsService,
    private readonly blockConfirmationQueueService: BlockConfirmationQueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.startBlockWatcher();
    this.logger.log('Block confirmation watcher started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.unwatchBlockNumber) {
      this.unwatchBlockNumber();
      this.unwatchBlockNumber = null;
    }
    this.logger.log('Block confirmation watcher stopped');
  }

  private async startBlockWatcher() {
    this.unwatchBlockNumber = this.blockchain.watchBlockNumber({
      onBlockNumber: async (blockNumber) => {
        await this.processNewBlock(blockNumber);
      },
      onError: (error) => {
        this.logger.error(
          `Error in block watcher: ${error.message}`,
          error.stack,
        );
      },
    });
  }

  private async processNewBlock(blockNumber: bigint): Promise<void> {
    try {
      this.logger.debug(`New block detected: ${blockNumber}`);
      const pendingPayments = await this.paymentsService.findPendingPayments();

      if (pendingPayments.length === 0) return;

      this.logger.debug(
        `Enqueuing ${pendingPayments.length} pending payment(s) for block ${blockNumber}`,
      );

      const jobs = pendingPayments.map((payment) => ({
        jobType: BlockConfirmationJobType.ProcessConfirmation,
        paymentId: payment.id,
        currentBlockNumber: blockNumber.toString(),
        txHash: payment.txHash,
        transactionBlockNumber: payment.blockNumber,
      }));

      if (jobs.length === 0) return;
      await this.blockConfirmationQueueService.enqueueConfirmations(jobs);
    } catch (error) {
      this.logger.error(
        `Error enqueuing block confirmations: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
