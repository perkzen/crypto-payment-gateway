import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { payment } from './payment.schema';
import { webhookSubscription } from './webhook-subscription.schema';

export const merchant = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),

  displayName: text('display_name'),
  contactEmail: text('contact_email'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const merchantRelations = relations(merchant, ({ one, many }) => ({
  user: one(user, {
    fields: [merchant.userId],
    references: [user.id],
  }),
  payments: many(payment),
  webhookSubscriptions: many(webhookSubscription),
}));
