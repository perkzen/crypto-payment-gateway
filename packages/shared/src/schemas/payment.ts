import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  network: z
    .string()
    .min(1)
    .describe('The blockchain network, e.g., "ethereum"'),
  address: z.string().min(1).describe('The payment address'),
  txHash: z
    .string()
    .describe('The transaction hash from the blockchain'),
  tokenAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address')
    .optional()
    .describe(
      'Token address for ERC-20 payments (undefined for native payments)',
    ),
  paidAmount: z
    .string()
    .regex(/^\d+$/, 'Must be a valid numeric string')
    .describe(
      'The amount that was paid in crypto. For native payments: amount in wei. For token payments: amount in token units (not converted to ETH)',
    ),
  blockNumber: z
    .string()
    .describe('The block number where the transaction was mined'),
});

export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export const UpdatePaymentSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'failed'])
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
  tokenAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address')
    .optional()
    .describe(
      'Token address for ERC-20 payments (null/undefined for native payments)',
    ),
  paidAmount: z
    .string()
    .regex(/^\d+$/, 'Must be a valid numeric string')
    .optional()
    .describe(
      'The amount that was paid in crypto. For native payments: amount in wei. For token payments: amount in token units (not converted to ETH)',
    ),
  blockNumber: z
    .string()
    .optional()
    .describe('The block number where the transaction was mined'),
  confirmedAt: z
    .date()
    .optional()
    .describe('The timestamp when the payment reached minimum confirmations'),
});

export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;
