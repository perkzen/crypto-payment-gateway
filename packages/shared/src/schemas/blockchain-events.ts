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

// Schema that transforms BigInt to string for serialization
const bigintToStringSchema = z.union([
  z.bigint().transform((val) => val.toString()),
  z.string().regex(/^\d+$/, 'Must be a valid numeric string'),
]);

// Base schema for PaidNative event (with BigInt as strings for serialization)
export const PaidNativeEventSchema = z.object({
  checkoutSessionId: bytes32Schema,
  payer: addressSchema,
  merchant: addressSchema,
  grossAmount: bigintToStringSchema,
  feeAmount: bigintToStringSchema,
  transactionHash: transactionHashSchema,
  blockNumber: bigintToStringSchema,
});

export type PaidNativeEvent = z.infer<typeof PaidNativeEventSchema>;

// PaidToken event extends PaidNative and adds token address
export const PaidTokenEventSchema = PaidNativeEventSchema.extend({
  token: addressSchema,
});

export type PaidTokenEvent = z.infer<typeof PaidTokenEventSchema>;
