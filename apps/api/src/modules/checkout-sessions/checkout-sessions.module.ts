import { CheckoutSessionsService } from '@app/modules/checkout-sessions/checkout-sessions.service';
import { Module } from '@nestjs/common';
import { CheckoutSessionsController } from './checkout-sessions.controller';

@Module({
  controllers: [CheckoutSessionsController],
  providers: [CheckoutSessionsService],
})
export class CheckoutSessionsModule {}
