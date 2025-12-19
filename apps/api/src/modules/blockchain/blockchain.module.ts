import { getBlockchainClient } from '@app/modules/blockchain/config/blockchain.config';
import { BLOCKCHAIN_CLIENT } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { CheckoutSessionsModule } from '@app/modules/checkout-sessions/checkout-sessions.module';
import { PaymentsModule } from '@app/modules/payments/payments.module';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';
import { WebhooksModule } from '@app/modules/webhooks/webhooks.module';
import { WalletsModule } from '@app/modules/wallets/wallets.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockConfirmationProcessor } from './processors/block-confirmation.processor';
import { BlockchainEventProcessor } from './processors/blockchain-event.processor';
import { BlockConfirmationQueueService } from './services/block-confirmation-queue.service';
import { BlockConfirmationService } from './services/block-confirmation.service';
import { BlockchainEventQueueService } from './services/blockchain-event-queue.service';
import { BlockchainService } from './services/blockchain.service';

@Module({
  imports: [
    ConfigModule,
    PaymentsModule,
    CheckoutSessionsModule,
    WalletsModule,
    WebhooksModule,
    ...configureQueue([QueueName.BLOCKCHAIN_EVENTS, QueueName.BLOCK_CONFIRMATIONS]),
  ],
  providers: [
    BlockchainService,
    BlockchainEventQueueService,
    BlockchainEventProcessor,
    BlockConfirmationQueueService,
    BlockConfirmationProcessor,
    BlockConfirmationService,
    {
      provide: BLOCKCHAIN_CLIENT,
      useFactory: getBlockchainClient,
      inject: [ConfigService],
    },
  ],
  exports: [BlockchainEventQueueService, BlockConfirmationQueueService],
})
export class BlockchainModule {}
