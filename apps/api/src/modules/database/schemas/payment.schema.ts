import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
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

  // Fiat stored in cents
  amountFiat: integer('amount_fiat').notNull(),
  fiatCurrency: text('fiat_currency').notNull(),

  network: text('network').notNull(),
  address: text('address').notNull(),
  txHash: text('tx_hash'),
  minConfirmations: integer('min_confirmations').notNull().default(12),
  confirmations: integer('confirmations').notNull().default(0),

  metadata: jsonb('metadata'),

  expiresAt: timestamp('expires_at', { withTimezone: true }),
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
