import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  amountFiat: z.number().min(1).describe('The amount to be charged in cents'),
  fiatCurrency: z
    .string()
    .length(3)
    .describe('The three-letter ISO currency code, e.g., "USD"'),
  network: z.string().min(1).describe('The blockchain network, e.g., "ethereum"'),
  address: z.string().min(1).describe('The payment address'),
  minConfirmations: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Minimum number of confirmations required (default: 12)'),
  metadata: z
    .record(z.string())
    .optional()
    .describe('Optional key-value pairs to attach to the payment'),
  expiresAt: z
    .date()
    .optional()
    .describe('Optional expiration time for the payment'),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = z.object({
  status: z
    .enum([
      'pending',
      'waiting_for_confirmations',
      'confirmed',
      'underpaid',
      'overpaid',
      'expired',
      'failed',
      'canceled',
    ])
    .optional()
    .describe('The payment status'),
  txHash: z
    .string()
    .optional()
    .describe('The transaction hash from the blockchain'),
  confirmations: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('The number of confirmations received'),
  metadata: z
    .record(z.string())
    .optional()
    .describe('Optional key-value pairs to update on the payment'),
  expiresAt: z
    .date()
    .nullish()
    .describe('Optional expiration time for the payment (null to clear, undefined to leave unchanged)'),
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

