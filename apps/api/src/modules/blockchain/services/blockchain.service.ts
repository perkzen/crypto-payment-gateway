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
  type PaidNativeEvent,
  PaidNativeEventSchema,
  type PaidTokenEvent,
  PaidTokenEventSchema,
  cryptoPayAbi,
} from '@workspace/shared';
import { type Address, type PublicClient } from 'viem';
import { type z } from 'zod';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private unwatchPaidNative: (() => void) | null = null;
  private unwatchPaidToken: (() => void) | null = null;
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
    await this.startPaidNativeListener(latestBlock);
    await this.startPaidTokenListener(latestBlock);
    this.logger.log('Event listeners started successfully');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Stopping blockchain event listeners');

    if (this.unwatchPaidNative) {
      this.unwatchPaidNative();
      this.unwatchPaidNative = null;
    }

    if (this.unwatchPaidToken) {
      this.unwatchPaidToken();
      this.unwatchPaidToken = null;
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
      onLogs: (logs) => {
        this.logger.log(`Received ${logs.length} ${eventName} event(s)`);

        const events = logs
          .map((log) => {
            const result = schema.safeParse({
              ...log.args,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber ?? 0n,
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

        void onEvents(events);
      },
      onError: (error) => {
        this.logger.error(
          `Error in ${eventName} event watcher: ${error.message}`,
          error.stack,
        );
      },
    });
  }

  private async startPaidNativeListener(fromBlock: bigint): Promise<void> {
    this.unwatchPaidNative = this.watchContractEvent({
      fromBlock,
      eventName: BlockchainEventName.PaidNative,
      schema: PaidNativeEventSchema,
      onEvents: (events: PaidNativeEvent[]) =>
        this.blockchainEventQueueService.enqueuePaidNative(events),
    });

    this.logger.log(
      `PaidNative event listener registered and watching for live events from block ${fromBlock}`,
    );
  }

  private async startPaidTokenListener(fromBlock: bigint): Promise<void> {
    this.unwatchPaidToken = this.watchContractEvent({
      fromBlock,
      eventName: BlockchainEventName.PaidToken,
      schema: PaidTokenEventSchema,
      onEvents: (events: PaidTokenEvent[]) =>
        this.blockchainEventQueueService.enqueuePaidToken(events),
    });

    this.logger.log(
      `PaidToken event listener registered and watching for live events from block ${fromBlock}`,
    );
  }
}
