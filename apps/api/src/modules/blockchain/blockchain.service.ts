import { Blockchain } from '@app/modules/blockchain/decorators/blockchain.decorator';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaidNativeEventSchema,
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
    onLogs,
  }: {
    eventName: 'PaidNative' | 'PaidToken';
    schema: TSchema;
    fromBlock: bigint;
    onLogs: (validatedEvents: TEvent[]) => void | Promise<void>;
  }): () => void {
    return this.blockchain.watchContractEvent({
      address: this.SMART_CONTRACT_ADDRESS,
      abi: cryptoPayAbi,
      eventName,
      fromBlock,
      pollingInterval: 4000,
      onLogs: async (logs) => {
        this.logger.log(`Received ${logs.length} ${eventName} event(s)`);
        const validatedEvents: TEvent[] = [];

        for (const log of logs) {
          try {
            const eventData = schema.parse({
              ...log.args,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber ?? 0n,
            }) as TEvent;

            validatedEvents.push(eventData);
          } catch (error) {
            this.logger.error(
              `Error processing ${eventName} log: ${
                error instanceof Error ? error.message : String(error)
              }`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }

        if (validatedEvents.length > 0) {
          await onLogs(validatedEvents);
        }
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
      eventName: 'PaidNative',
      schema: PaidNativeEventSchema,
      onLogs: async (events) => {
        // Validated events are ready to be passed to a worker or processed
        for (const event of events) {
          this.logger.log(`PaidNative event: ${JSON.stringify(event)}`);
          // TODO: Pass to worker or process as needed
        }
      },
    });

    this.logger.log(
      `PaidNative event listener registered and watching for live events from block ${fromBlock}`,
    );
  }

  private async startPaidTokenListener(fromBlock: bigint): Promise<void> {
    this.unwatchPaidToken = this.watchContractEvent({
      fromBlock,
      eventName: 'PaidToken',
      schema: PaidTokenEventSchema,
      onLogs: async (events) => {
        // Validated events are ready to be passed to a worker or processed
        for (const event of events) {
          this.logger.log(`PaidToken event: ${JSON.stringify(event)}`);
          // TODO: Pass to worker or process as needed
        }
      },
    });

    this.logger.log(
      `PaidToken event listener registered and watching for live events from block ${fromBlock}`,
    );
  }
}
