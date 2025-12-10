import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { merchant } from './merchant.schema';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'waiting_for_confirmations',
  'confirmed',
  'underpaid',
  'overpaid',
  'expired',
  'failed',
  'canceled',
]);

export const payment = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => merchant.id, {
    onDelete: 'cascade',
  }),

  status: paymentStatusEnum('status').notNull(),

  network: text('network').notNull(),
  address: text('address').notNull(),
  txHash: text('tx_hash'),
  // Token address for ERC-20 payments (null for native payments)
  tokenAddress: text('token_address'),
  // Amount paid in crypto (stored as string to handle large BigInt values)
  // For native payments: amount in wei
  // For token payments: amount in token units (not converted to ETH)
  paidAmount: text('paid_amount'),
  confirmations: integer('confirmations').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const paymentRelations = relations(payment, ({ one }) => ({
  merchant: one(merchant, {
    fields: [payment.merchantId],
    references: [merchant.id],
  }),
}));
