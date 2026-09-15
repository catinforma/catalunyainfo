CREATE TYPE "public"."contact_status" AS ENUM('new', 'read', 'answered', 'spam');--> statement-breakpoint
CREATE TYPE "public"."contact_topic" AS ENUM('correction', 'editorial', 'press', 'collaboration', 'privacy', 'other');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"topic" "contact_topic" DEFAULT 'other' NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(254) NOT NULL,
	"about_path" varchar(600),
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'new' NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_created_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_status_idx" ON "contact_messages" USING btree ("status");