import { getBlockchainClient } from '@app/modules/blockchain/config/blockchain.config';
import { BLOCKCHAIN_CLIENT } from '@app/modules/blockchain/decorators/blockchain.decorator';
import { CheckoutSessionsModule } from '@app/modules/checkout-sessions/checkout-sessions.module';
import { PaymentsModule } from '@app/modules/payments/payments.module';
import { Module } from '@nestjs/common';
import { BlockchainEventProcessorService } from './blockchain-event-processor.service';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [PaymentsModule, CheckoutSessionsModule],
  providers: [
    BlockchainService,
    BlockchainEventProcessorService,
    {
      provide: BLOCKCHAIN_CLIENT,
      useFactory: getBlockchainClient,
    },
  ],
})
export class BlockchainModule {}
