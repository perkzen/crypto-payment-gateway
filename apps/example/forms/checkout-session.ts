import { formOptions } from '@tanstack/react-form';
import type { CreateCheckoutSession } from '@workspace/shared';
import { CreateCheckoutSessionSchema } from '@workspace/shared';

const defaultValues: Omit<CreateCheckoutSession, 'customerEmail' | 'expiresInMinutes'> & {
  customerEmail?: string;
  expiresInMinutes?: number;
} = {
  amountFiat: 5000,
  fiatCurrency: 'USD',
  allowedCryptoCurrencies: ['ETH'],
  allowedNetworks: ['ethereum'],
  customerEmail: undefined,
  successUrl: '',
  cancelUrl: '',
  expiresInMinutes: 60,
};

export const checkoutSessionFormOptions = formOptions({
  defaultValues,
  validators: {
    onSubmit: CreateCheckoutSessionSchema,
  },
});

export { defaultValues as checkoutSessionDefaultValues };

