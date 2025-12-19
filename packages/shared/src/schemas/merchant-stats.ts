import { z } from 'zod';

export const MerchantStatsSchema = z.object({
  totalRevenue: z
    .number()
    .int()
    .min(0)
    .describe('Total revenue in cents from confirmed payments'),
  totalTransactions: z
    .number()
    .int()
    .min(0)
    .describe('Total number of payment transactions'),
  successRate: z
    .number()
    .min(0)
    .max(100)
    .describe('Success rate as percentage (0-100), calculated as confirmed / (confirmed + failed)'),
  confirmedCount: z
    .number()
    .int()
    .min(0)
    .describe('Number of confirmed payments'),
  failedCount: z
    .number()
    .int()
    .min(0)
    .describe('Number of failed payments'),
});

export type MerchantStats = z.infer<typeof MerchantStatsSchema>;
