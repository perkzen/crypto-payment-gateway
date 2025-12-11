import { NotFoundException } from '@nestjs/common';
import { PaymentErrorCode } from '../enums/payment-error-code.enum';

export class PaymentNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Payment with id ${id} not found`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: PaymentErrorCode.PAYMENT_NOT_FOUND,
    };
  }
}


