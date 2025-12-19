import { z } from 'zod';
import { createPaginatedResponseSchema } from './pagination';

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

export const GetPaymentsQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('Page number (1-indexed)'),
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Number of items per page (max 100)'),
  status: z
    .enum(['pending', 'confirmed', 'failed'])
    .optional()
    .describe('Filter by payment status'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc')
    .describe('Sort order by createdAt'),
});

export type GetPaymentsQuery = z.infer<typeof GetPaymentsQuerySchema>;

export const PaymentSchema = z.object({
  id: z.string().uuid().describe('Payment ID'),
  merchantId: z.string().uuid().describe('Merchant ID'),
  status: z
    .enum(['pending', 'confirmed', 'failed'])
    .describe('Payment status'),
  network: z.string().describe('Blockchain network'),
  address: z.string().describe('Payment address'),
  txHash: z.string().describe('Transaction hash'),
  tokenAddress: z.string().nullable().describe('Token address (null for native payments)'),
  paidAmount: z.string().describe('Amount paid in crypto'),
  confirmations: z.number().int().min(0).describe('Number of confirmations'),
  blockNumber: z.string().describe('Block number'),
  confirmedAt: z.date().nullable().describe('Confirmation timestamp'),
  createdAt: z.date().describe('Creation timestamp'),
  updatedAt: z.date().describe('Last update timestamp'),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const PaginatedPaymentsResponseSchema =
  createPaginatedResponseSchema(PaymentSchema);

export type PaginatedPaymentsResponse = z.infer<
  typeof PaginatedPaymentsResponseSchema
>;
