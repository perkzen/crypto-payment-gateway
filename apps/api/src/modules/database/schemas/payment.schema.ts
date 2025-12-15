import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { merchant } from './merchant.schema';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'confirmed',
  'failed',
]);

export const payment = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    merchantId: uuid('merchant_id').references(() => merchant.id, {
      onDelete: 'cascade',
    }),

    status: paymentStatusEnum('status').notNull(),

    network: text('network').notNull(),
    address: text('address').notNull(),
    txHash: text('tx_hash').notNull(),
    // Token address for ERC-20 payments (null for native payments)
    tokenAddress: text('token_address'),
    // Amount paid in crypto (stored as string to handle large BigInt values)
    // For native payments: amount in wei
    // For token payments: amount in token units (not converted to ETH)
    paidAmount: text('paid_amount').notNull(),
    confirmations: integer('confirmations').notNull().default(0),
    // Block number where the transaction was mined (for confirmation tracking)
    blockNumber: text('block_number').notNull(),
    // Timestamp when payment reached minimum confirmations
    confirmedAt: timestamp('confirmed_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Ensure we never create duplicate payments for the same transaction
    unique('payment_tx_hash_unique').on(table.txHash),
  ],
);

export const paymentRelations = relations(payment, ({ one }) => ({
  merchant: one(merchant, {
    fields: [payment.merchantId],
    references: [merchant.id],
  }),
}));
