import { NotFoundException } from '@nestjs/common';
import { CheckoutSessionErrorCode } from '../enums/checkout-session-error-code.enum';

export class CheckoutSessionNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Checkout session with id ${id} not found`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: CheckoutSessionErrorCode.CHECKOUT_SESSION_NOT_FOUND,
    };
  }
}
