import { ForbiddenException } from '@nestjs/common';
import { KycErrorCode } from '../enums/kyc-error-code.enum';

export class KycNotVerifiedException extends ForbiddenException {
  constructor() {
    super('Merchant KYC verification is required to create checkout sessions');
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: KycErrorCode.KYC_NOT_VERIFIED,
    };
  }
}
