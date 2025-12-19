import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { merchant } from './merchant.schema';

export const webhookSubscription = pgTable('webhook_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id')
    .notNull()
    .references(() => merchant.id, {
      onDelete: 'cascade',
    }),
  url: text('url').notNull(),
  events: text('events').array().notNull(),
  secret: text('secret'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const webhookSubscriptionRelations = relations(
  webhookSubscription,
  ({ one }) => ({
    merchant: one(merchant, {
      fields: [webhookSubscription.merchantId],
      references: [merchant.id],
    }),
  }),
);
