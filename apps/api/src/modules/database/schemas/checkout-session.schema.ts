import { merchant } from '@app/modules/database/schemas/merchant.schema';
import { payment } from '@app/modules/database/schemas/payment.schema';
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const checkoutSessionStatusEnum = pgEnum('checkout_session_status', [
  'open',
  'completed',
  'expired',
  'canceled',
]);

export const checkoutSession = pgTable('checkout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),

  merchantId: uuid('merchant_id')
    .notNull()
    .references(() => merchant.id),

  status: checkoutSessionStatusEnum('status').notNull().default('open'),

  // fiat price in cents
  amountFiat: integer('amount_fiat').notNull(),
  fiatCurrency: text('fiat_currency').notNull(),

  allowedCryptoCurrencies: jsonb('allowed_crypto_currencies')
    .$type<string[]>()
    .notNull(),

  allowedNetworks: jsonb('allowed_networks').$type<string[]>().notNull(),

  // linked payment (null until created)
  paymentId: uuid('payment_id').references(() => payment.id),

  successUrl: text('success_url').notNull(),
  cancelUrl: text('cancel_url').notNull(),
  checkoutUrl: text('checkout_url').notNull(),

  customerEmail: text('customer_email'),

  metadata: jsonb('metadata'),

  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
