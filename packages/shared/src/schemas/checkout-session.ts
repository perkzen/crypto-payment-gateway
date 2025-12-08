import { z } from 'zod';

export const CreateCheckoutSessionSchema = z.object({
  amountFiat: z.number().min(1).describe('The amount to be charged in cents'),

  fiatCurrency: z
    .string()
    .length(3)
    .describe('The three-letter ISO currency code, e.g., "USD"'),

  allowedCryptoCurrencies: z
    .array(z.string())
    .min(1)
    .describe(
      'A list of allowed cryptocurrency codes for payment, e.g., ["BTC", "ETH"]',
    ),

  allowedNetworks: z
    .array(z.string())
    .min(1)
    .describe(
      'A list of allowed blockchain networks for payment, e.g., ["hardhat", "ethereum", "bitcoin"]',
    ),

  customerEmail: z
    .string()
    .email()
    .optional()
    .describe('Optional email address of the customer'),

  metadata: z
    .record(z.string())
    .optional()
    .describe(
      'Optional key-value pairs to attach to the checkout session for later reference',
    ),

  successUrl: z
    .string()
    .url()
    .describe('The URL to redirect to after a successful payment'),

  cancelUrl: z
    .string()
    .url()
    .describe('The URL to redirect to if the payment is canceled'),

  expiresInMinutes: z
    .number()
    .min(1)
    .max(1440)
    .optional()
    .describe(
      'Optional expiration time for the checkout session in minutes (default is 60 minutes)',
    ),
});

export type CreateCheckoutSession = z.infer<typeof CreateCheckoutSessionSchema>;

export const CreateCheckoutSessionResultSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe('The unique identifier of the checkout session'),

  checkoutUrl: z
    .string()
    .url()
    .describe('The URL where the customer can complete the payment'),

  expiresAt: z
    .coerce.date()
    .describe('The timestamp when the checkout session expires'),

  metadata: z
    .record(z.string())
    .nullable()
    .optional()
    .describe(
      'Optional key-value pairs attached to the checkout session for later reference',
    ),
});

export type CreateCheckoutSessionResult = z.infer<
  typeof CreateCheckoutSessionResultSchema
>;

export const PublicCheckoutSessionSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe('The unique identifier of the checkout session'),

  amountFiat: z.number().describe('The amount to be charged in cents'),

  fiatCurrency: z
    .string()
    .length(3)
    .describe('The three-letter ISO currency code, e.g., "USD"'),

  allowedCryptoCurrencies: z
    .array(z.string())
    .describe(
      'A list of allowed cryptocurrency codes for payment, e.g., ["BTC", "ETH"]',
    ),

  allowedNetworks: z
    .array(z.string())
    .describe(
      'A list of allowed blockchain networks for payment, e.g., ["hardhat", "ethereum", "bitcoin"]',
    ),

  merchantWalletAddress: z
    .string()
    .describe('The merchant wallet address where payments should be sent'),

  expiresAt: z
    .coerce.date()
    .describe('The ISO 8601 timestamp when the checkout session expires'),
});

export type PublicCheckoutSession = z.infer<typeof PublicCheckoutSessionSchema>;
