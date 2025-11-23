CREATE TYPE "public"."payment_status" AS ENUM('pending', 'waiting_for_confirmations', 'confirmed', 'underpaid', 'overpaid', 'expired', 'failed', 'canceled');--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid,
	"status" "payment_status" NOT NULL,
	"amount_fiat" integer NOT NULL,
	"fiatCurrency" text NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"tx_hash" text,
	"min_confirmations" integer DEFAULT 12 NOT NULL,
	"confirmations" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"expires_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "display_name" text DEFAULT null NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_user_id_unique" UNIQUE("user_id");