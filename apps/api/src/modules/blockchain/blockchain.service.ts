import { BlockchainEventProcessorService } from '@app/modules/blockchain/blockchain-event-processor.service';
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

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private unwatchPaidNative: (() => void) | null = null;
  private unwatchPaidToken: (() => void) | null = null;

  constructor(
    @Blockchain()
    private readonly blockchain: PublicClient,
    private readonly configService: ConfigService,
    private readonly eventProcessor: BlockchainEventProcessorService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.startPaidNativeListener();
    await this.startPaidTokenListener();
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

  private async startPaidNativeListener(): Promise<void> {
    const contractAddress = this.configService.getOrThrow(
      'CRYPTO_PAY_CONTRACT_ADDRESS',
    ) as Address;

    this.logger.log(
      `Starting PaidNative event listener for contract ${contractAddress}`,
    );

    this.unwatchPaidNative = this.blockchain.watchContractEvent({
      address: contractAddress,
      abi: cryptoPayAbi,
      eventName: 'PaidNative',
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            // Validate event data with Zod schema
            const eventData = PaidNativeEventSchema.parse({
              invoiceId: log.args.invoiceId,
              payer: log.args.payer,
              merchant: log.args.merchant,
              grossAmount: log.args.grossAmount,
              feeAmount: log.args.feeAmount,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber ?? 0n,
            });

            this.logger.log(`PaidNative event received: ${JSON.stringify(eventData)}`);
          } catch (error) {
            this.logger.error(
              `Error processing PaidNative log: ${error instanceof Error ? error.message : String(error)}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }
      },
    });
  }

  private async startPaidTokenListener(): Promise<void> {
    const contractAddress = this.configService.getOrThrow(
      'CRYPTO_PAY_CONTRACT_ADDRESS',
    ) as Address;

    this.logger.log(
      `Starting PaidToken event listener for contract ${contractAddress}`,
    );

    this.unwatchPaidToken = this.blockchain.watchContractEvent({
      address: contractAddress,
      abi: cryptoPayAbi,
      eventName: 'PaidToken',
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            // Validate event data with Zod schema
            const eventData = PaidTokenEventSchema.parse({
              invoiceId: log.args.invoiceId,
              payer: log.args.payer,
              merchant: log.args.merchant,
              token: log.args.token,
              grossAmount: log.args.grossAmount,
              feeAmount: log.args.feeAmount,
              transactionHash: log.transactionHash,
              blockNumber: log.blockNumber ?? 0n,
            });

            this.logger.log(`PaidToken event received: ${JSON.stringify(eventData)}`);
          } catch (error) {
            this.logger.error(
              `Error processing PaidToken log: ${error instanceof Error ? error.message : String(error)}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }
      },
    });
  }
}
