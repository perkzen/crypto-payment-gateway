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

// token is address(0) for native payments, token address for ERC-20 payments
export const PaidEventSchema = z.object({
  checkoutSessionId: bytes32Schema,
  payer: addressSchema,
  merchant: addressSchema,
  token: addressSchema, // address(0) for native, token address for ERC-20
  grossAmount: bigintToStringSchema,
  feeAmount: bigintToStringSchema,
  transactionHash: transactionHashSchema,
  blockNumber: bigintToStringSchema,
});

export type PaidEvent = z.infer<typeof PaidEventSchema>;
