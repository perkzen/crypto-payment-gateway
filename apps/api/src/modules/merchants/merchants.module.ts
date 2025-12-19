import { MerchantsController } from '@app/modules/merchants/merchants.controller';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
