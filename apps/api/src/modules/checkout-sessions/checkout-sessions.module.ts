import { CheckoutSessionsService } from '@app/modules/checkout-sessions/checkout-sessions.service';
import { KycModule } from '@app/modules/kyc/kyc.module';
import { MerchantsModule } from '@app/modules/merchants/merchants.module';
import { WalletsModule } from '@app/modules/wallets/wallets.module';
import { Module } from '@nestjs/common';
import { CheckoutSessionsController } from './checkout-sessions.controller';

@Module({
  imports: [MerchantsModule, WalletsModule, KycModule],
  controllers: [CheckoutSessionsController],
  providers: [CheckoutSessionsService],
  exports: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
