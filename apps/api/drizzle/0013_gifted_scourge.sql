ALTER TABLE "checkout_sessions" ALTER COLUMN "hashed_id" SET DEFAULT null;--> statement-breakpoint
CREATE INDEX "checkout_session_hashed_id_idx" ON "checkout_sessions" USING btree ("hashed_id");--> statement-breakpoint
CREATE INDEX "payment_tx_hash_idx" ON "payments" USING btree ("tx_hash");