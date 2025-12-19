import { MerchantsModule } from '@app/modules/merchants/merchants.module';
import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { MockedKycProvider } from './providers/mocked-kyc.provider';

@Module({
  imports: [MerchantsModule],
  controllers: [KycController],
  providers: [KycService, MockedKycProvider],
  exports: [KycService],
})
export class KycModule {}
