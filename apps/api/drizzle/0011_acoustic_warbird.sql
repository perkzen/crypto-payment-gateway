ALTER TABLE "checkout_sessions" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "block_number" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "confirmed_at" timestamp;