import { merchant } from '@app/modules/database/schemas/merchant.schema';
import { payment } from '@app/modules/database/schemas/payment.schema';
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const checkoutSession = pgTable('checkout_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),

  merchantId: uuid('merchant_id')
    .notNull()
    .references(() => merchant.id),

  // Hashed ID (bytes32) for smart contract - keccak256(toHex(id))
  hashedId: text('hashed_id').unique(),

  amountFiat: integer('amount_fiat').notNull(),
  fiatCurrency: text('fiat_currency').notNull(),

  allowedCryptoCurrencies: jsonb('allowed_crypto_currencies')
    .$type<string[]>()
    .notNull(),

  allowedNetworks: jsonb('allowed_networks').$type<string[]>().notNull(),

  paymentId: uuid('payment_id').references(() => payment.id),
  completedAt: timestamp('completed_at'),

  successUrl: text('success_url').notNull(),
  cancelUrl: text('cancel_url').notNull(),
  checkoutUrl: text('checkout_url').notNull(),

  customerEmail: text('customer_email'),

  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
