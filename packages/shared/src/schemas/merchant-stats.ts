import { z } from 'zod';

export const DailyStatsSchema = z.object({
  date: z.string().describe('Date in ISO format (YYYY-MM-DD)'),
  transactions: z
    .number()
    .int()
    .min(0)
    .describe('Number of transactions on this date'),
  revenue: z
    .number()
    .int()
    .min(0)
    .describe('Revenue in cents from confirmed payments on this date'),
  successRate: z
    .number()
    .min(0)
    .max(100)
    .describe('Success rate as percentage (0-100) for this date'),
  confirmed: z
    .number()
    .int()
    .min(0)
    .describe('Number of confirmed payments on this date'),
  failed: z
    .number()
    .int()
    .min(0)
    .describe('Number of failed payments on this date'),
});

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
  timeSeries: z
    .array(DailyStatsSchema)
    .describe('Daily statistics for the last 30 days'),
});

export type MerchantStats = z.infer<typeof MerchantStatsSchema>;
export type DailyStats = z.infer<typeof DailyStatsSchema>;
