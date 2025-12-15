DROP INDEX "payment_tx_hash_idx";--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payment_tx_hash_unique" UNIQUE("tx_hash");