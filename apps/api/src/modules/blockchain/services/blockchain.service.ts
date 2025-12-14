import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { BlockchainEventQueueService } from '@app/modules/blockchain/services/blockchain-event-queue.service';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlockchainEventName,
  type PaidEvent,
  PaidEventSchema,
  cryptoPayAbi,
} from '@workspace/shared';
import { type Address, type PublicClient } from 'viem';
import { type z } from 'zod';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private unwatchPaid: (() => void) | null = null;
  private readonly SMART_CONTRACT_ADDRESS: Address;

  constructor(
    @Blockchain()
    private readonly blockchain: PublicClient,
    private readonly configService: ConfigService,
    private readonly blockchainEventQueueService: BlockchainEventQueueService,
  ) {
    this.SMART_CONTRACT_ADDRESS = this.configService.getOrThrow(
      'CRYPTO_PAY_CONTRACT_ADDRESS',
    ) as Address;
  }

  async onModuleInit(): Promise<void> {
    await this.assertContractExists();
    const latestBlock = await this.blockchain.getBlockNumber();
    await this.startPaidListener(latestBlock);
    this.logger.log('Event listeners started successfully');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Stopping blockchain event listeners');

    if (this.unwatchPaid) {
      this.unwatchPaid();
      this.unwatchPaid = null;
    }
  }

  private async assertContractExists() {
    const code = await this.blockchain.getCode({
      address: this.SMART_CONTRACT_ADDRESS,
    });
    if (code === null || code === '0x') {
      throw Error(
        `Blockchain contract with address ${this.SMART_CONTRACT_ADDRESS} does not exist.`,
      );
    }
  }

  /**
   * Generic function to watch contract events.
   * Validates events using the provided Zod schema and exposes validated data in `onLogs`.
   */
  private watchContractEvent<
    TSchema extends z.ZodTypeAny,
    TEvent extends z.infer<TSchema> = z.infer<TSchema>,
  >({
    eventName,
    fromBlock,
    schema,
    onEvents,
  }: {
    eventName: BlockchainEventName;
    schema: TSchema;
    fromBlock: bigint;
    onEvents: (events: TEvent[]) => void | Promise<void>;
  }): () => void {
    return this.blockchain.watchContractEvent({
      address: this.SMART_CONTRACT_ADDRESS,
      abi: cryptoPayAbi,
      eventName,
      fromBlock,
      pollingInterval: 4000,
      onLogs: async (logs) => {
        this.logger.log(`Received ${logs.length} ${eventName} event(s)`);

        const events = logs
          .map((log) => {
            const result = schema.safeParse({
              ...log.args,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber,
            });

            if (!result.success) {
              this.logger.error(
                `Error processing ${eventName} log: ${result.error.message}`,
                result.error.stack,
              );
              return null;
            }

            return result.data as TEvent;
          })
          .filter((event): event is TEvent => event !== null);

        await onEvents(events);
      },
      onError: (error) => {
        this.logger.error(
          `Error in ${eventName} event watcher: ${error.message}`,
          error.stack,
        );
      },
    });
  }

  private async startPaidListener(fromBlock: bigint): Promise<void> {
    this.unwatchPaid = this.watchContractEvent({
      fromBlock,
      eventName: BlockchainEventName.Paid,
      schema: PaidEventSchema,
      onEvents: (events: PaidEvent[]) =>
        this.blockchainEventQueueService.enqueuePaid(events),
    });

    this.logger.log(
      `Paid event listener registered and watching for live events from block ${fromBlock}`,
    );
  }
}
