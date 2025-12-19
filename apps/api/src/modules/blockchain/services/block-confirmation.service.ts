import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type PublicClient } from 'viem';
import { BlockConfirmationQueueService } from './block-confirmation-queue.service';

@Injectable()
export class BlockConfirmationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockConfirmationService.name);
  private unwatchBlockNumber: (() => void) | null = null;

  constructor(
    @Blockchain()
    private readonly blockchain: PublicClient,
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
        await this.blockConfirmationQueueService.enqueueBlockProcessing(
          blockNumber,
        );
      },
      onError: (error) => {
        this.logger.error(
          `Error in block watcher: ${error.message}`,
          error.stack,
        );
      },
    });
  }
}
