import { z } from 'zod';

// Helper schemas for Ethereum types
const hexStringSchema = (length: number) =>
  z
    .string()
    .regex(/^0x[a-fA-F0-9]+$/, 'Must be a valid hex string')
    .length(length, `Must be exactly ${length} characters`);

const addressSchema = hexStringSchema(42).describe('Ethereum address');

const bytes32Schema = hexStringSchema(66).describe('Bytes32 hash');

const transactionHashSchema = hexStringSchema(66).describe('Transaction hash');

const bigintSchema = z.union([
  z.bigint(),
  z.string().regex(/^\d+$/, 'Must be a valid numeric string').transform((val) => BigInt(val)),
]);

// Base schema for PaidNative event
export const PaidNativeEventSchema = z.object({
  invoiceId: bytes32Schema,
  payer: addressSchema,
  merchant: addressSchema,
  grossAmount: bigintSchema,
  feeAmount: bigintSchema,
  transactionHash: transactionHashSchema,
  blockNumber: bigintSchema,
});

export type PaidNativeEvent = z.infer<typeof PaidNativeEventSchema>;

// PaidToken event extends PaidNative and adds token address
export const PaidTokenEventSchema = PaidNativeEventSchema.extend({
  token: addressSchema,
});

export type PaidTokenEvent = z.infer<typeof PaidTokenEventSchema>;

