import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
