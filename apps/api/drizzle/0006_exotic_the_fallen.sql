CREATE TYPE "public"."checkout_session_status" AS ENUM('open', 'completed', 'expired', 'canceled');--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"status" "checkout_session_status" DEFAULT 'open' NOT NULL,
	"amount_fiat" integer NOT NULL,
	"fiat_currency" text NOT NULL,
	"allowed_crypto_currencies" jsonb NOT NULL,
	"allowed_networks" jsonb NOT NULL,
	"payment_id" uuid,
	"success_url" text NOT NULL,
	"cancel_url" text NOT NULL,
	"checkout_url" text NOT NULL,
	"customer_email" text,
	"metadata" jsonb,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merchants" ALTER COLUMN "display_name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;