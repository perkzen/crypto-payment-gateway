import { NotFoundException } from '@nestjs/common';
import { MerchantErrorCode } from '../enums/merchant-error-code.enum';

export class MerchantNotFoundException extends NotFoundException {
  constructor(userId: string) {
    super(`Merchant for user with id ${userId} not found`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: MerchantErrorCode.MERCHANT_NOT_FOUND,
    };
  }
}



