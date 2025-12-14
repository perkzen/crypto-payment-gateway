ALTER TABLE "payments" ALTER COLUMN "tx_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "paid_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "block_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "hashed_id" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_hashed_id_unique" UNIQUE("hashed_id");