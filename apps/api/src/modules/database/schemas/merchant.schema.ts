import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { payment } from './payment.schema';
import { webhookSubscription } from './webhook-subscription.schema';

export const kycStatusEnum = pgEnum('kyc_status', [
  'not_started',
  'pending',
  'verified',
  'rejected',
]);

export const merchant = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),

  displayName: text('display_name'),
  contactEmail: text('contact_email'),

  kycStatus: kycStatusEnum('kyc_status').notNull().default('not_started'),
  kycProviderId: text('kyc_provider_id'),
  kycSubmittedAt: timestamp('kyc_submitted_at'),
  kycVerifiedAt: timestamp('kyc_verified_at'),
  kycRejectionReason: text('kyc_rejection_reason'),

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
