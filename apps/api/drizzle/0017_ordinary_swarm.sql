CREATE TYPE "public"."kyc_status" AS ENUM('not_started', 'pending', 'verified', 'rejected');--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "kyc_status" "kyc_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "kyc_provider_id" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "kyc_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "kyc_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "kyc_rejection_reason" text;