import { getBlockchainClient } from '@app/modules/blockchain/config/blockchain.config';
import { BLOCKCHAIN_CLIENT } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { CheckoutSessionsModule } from '@app/modules/checkout-sessions/checkout-sessions.module';
import { PaymentsModule } from '@app/modules/payments/payments.module';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';
import { Module } from '@nestjs/common';
import { BlockchainEventProcessor } from './processors/blockchain-event.processor';
import { BlockchainEventQueueService } from './services/blockchain-event-queue.service';
import { BlockchainService } from './services/blockchain.service';

@Module({
  imports: [
    PaymentsModule,
    CheckoutSessionsModule,
    ...configureQueue([QueueName.BLOCKCHAIN_EVENTS]),
  ],
  providers: [
    BlockchainService,
    BlockchainEventQueueService,
    BlockchainEventProcessor,
    {
      provide: BLOCKCHAIN_CLIENT,
      useFactory: getBlockchainClient,
    },
  ],
  exports: [BlockchainEventQueueService],
})
export class BlockchainModule {}
