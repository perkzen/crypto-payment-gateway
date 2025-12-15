ALTER TABLE "payments" ALTER COLUMN "expires_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "token_address" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paid_amount" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "amount_fiat";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "fiat_currency";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "min_confirmations";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "metadata";