import { CheckoutSessionsService } from '@app/modules/checkout-sessions/checkout-sessions.service';
import { MerchantsModule } from '@app/modules/merchants/merchants.module';
import { Module } from '@nestjs/common';
import { CheckoutSessionsController } from './checkout-sessions.controller';

@Module({
  imports: [MerchantsModule],
  controllers: [CheckoutSessionsController],
  providers: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
