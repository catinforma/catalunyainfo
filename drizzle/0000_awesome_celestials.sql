CREATE TYPE "public"."entry_status" AS ENUM('draft', 'review', 'ready', 'scheduled', 'published', 'needs_update', 'archived');--> statement-breakpoint
CREATE TYPE "public"."entry_type" AS ENUM('news', 'article', 'guide', 'destination', 'place', 'event', 'route', 'page');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('ca', 'es', 'en');--> statement-breakpoint
CREATE TYPE "public"."place_kind" AS ENUM('region', 'comarca', 'municipality', 'neighbourhood', 'natural_park', 'beach', 'mountain', 'monument', 'museum', 'venue', 'transport_hub', 'other');--> statement-breakpoint
CREATE TYPE "public"."redirect_kind" AS ENUM('permanent', 'temporary', 'gone');--> statement-breakpoint
CREATE TYPE "public"."relation_kind" AS ENUM('related', 'part_of', 'nearby', 'supersedes', 'see_also');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('official', 'primary', 'press', 'academic', 'own_reporting', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'author', 'viewer');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(60) NOT NULL,
	"entity_id" varchar(80),
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "author_translations" (
	"author_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"job_title" varchar(160),
	"bio" text,
	"expertise" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "author_translations_author_id_locale_pk" PRIMARY KEY("author_id","locale")
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(255),
	"avatar_media_id" uuid,
	"links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"section" varchar(40) NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_translations" (
	"category_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"description" text,
	"seo_title" varchar(200),
	"seo_description" varchar(400),
	CONSTRAINT "category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "entry_type" NOT NULL,
	"key" varchar(160),
	"primary_category_id" uuid,
	"author_id" uuid,
	"hero_media_id" uuid,
	"parent_id" uuid,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_categories" (
	"entry_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "entry_categories_entry_id_category_id_pk" PRIMARY KEY("entry_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "entry_relations" (
	"entry_id" uuid NOT NULL,
	"related_entry_id" uuid NOT NULL,
	"kind" "relation_kind" DEFAULT 'related' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "entry_relations_entry_id_related_entry_id_kind_pk" PRIMARY KEY("entry_id","related_entry_id","kind")
);
--> statement-breakpoint
CREATE TABLE "entry_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"note" varchar(300),
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entry_sources" (
	"entry_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"note" varchar(300),
	"accessed_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "entry_sources_entry_id_source_id_pk" PRIMARY KEY("entry_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "entry_tags" (
	"entry_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "entry_tags_entry_id_tag_id_pk" PRIMARY KEY("entry_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "entry_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"path" varchar(600) NOT NULL,
	"excerpt" text,
	"body" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"search_text" text DEFAULT '' NOT NULL,
	"seo_title" varchar(200),
	"seo_description" varchar(400),
	"canonical_url" text,
	"noindex" boolean DEFAULT false NOT NULL,
	"og_media_id" uuid,
	"published_at" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_verified_at" timestamp with time zone,
	"review_due_at" timestamp with time zone,
	"translated_from_locale" "locale",
	"translator_note" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"entry_id" uuid PRIMARY KEY NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"is_all_day" boolean DEFAULT false NOT NULL,
	"recurrence_rule" varchar(300),
	"venue_entry_id" uuid,
	"venue_name" varchar(240),
	"ticket_url" text,
	"is_free" boolean DEFAULT false NOT NULL,
	"organiser" varchar(240)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"mime_type" varchar(100) DEFAULT 'image/jpeg' NOT NULL,
	"width" integer,
	"height" integer,
	"blur_data_url" text,
	"credit" varchar(240),
	"credit_url" text,
	"license" varchar(120),
	"alt" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"caption" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"focal_x" double precision DEFAULT 0.5 NOT NULL,
	"focal_y" double precision DEFAULT 0.5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(600) NOT NULL,
	"locale" "locale" NOT NULL,
	"is_useful" boolean NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"entry_id" uuid PRIMARY KEY NOT NULL,
	"kind" "place_kind" DEFAULT 'other' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"comarca" varchar(120),
	"municipality" varchar(160),
	"postal_code" varchar(12),
	"street_address" varchar(300),
	"official_url" text,
	"opening_hours" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pricing" jsonb,
	"accessibility" jsonb
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_path" varchar(600) NOT NULL,
	"to_path" varchar(600),
	"kind" "redirect_kind" DEFAULT 'permanent' NOT NULL,
	"note" varchar(300),
	"hits" integer DEFAULT 0 NOT NULL,
	"last_hit_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"entry_id" uuid PRIMARY KEY NOT NULL,
	"distance_metres" integer,
	"ascent_metres" integer,
	"descent_metres" integer,
	"duration_minutes" integer,
	"difficulty" smallint,
	"is_circular" boolean DEFAULT false NOT NULL,
	"gpx_url" text,
	"start_entry_id" uuid
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" varchar(400)
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(240) NOT NULL,
	"publisher" varchar(240),
	"url" text,
	"type" "source_type" DEFAULT 'official' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_translations" (
	"tag_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	CONSTRAINT "tag_translations_tag_id_locale_pk" PRIMARY KEY("tag_id","locale")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'author' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"author_id" uuid,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "author_translations" ADD CONSTRAINT "author_translations_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_primary_category_id_categories_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_categories" ADD CONSTRAINT "entry_categories_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_categories" ADD CONSTRAINT "entry_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_relations" ADD CONSTRAINT "entry_relations_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_relations" ADD CONSTRAINT "entry_relations_related_entry_id_entries_id_fk" FOREIGN KEY ("related_entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_revisions" ADD CONSTRAINT "entry_revisions_translation_id_entry_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "public"."entry_translations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_revisions" ADD CONSTRAINT "entry_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_sources" ADD CONSTRAINT "entry_sources_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_sources" ADD CONSTRAINT "entry_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_translations" ADD CONSTRAINT "entry_translations_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_translations" ADD CONSTRAINT "entry_translations_og_media_id_media_id_fk" FOREIGN KEY ("og_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_translations" ADD CONSTRAINT "entry_translations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_translations" ADD CONSTRAINT "entry_translations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "authors_slug_key" ON "authors" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_key_key" ON "categories" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_locale_key" ON "category_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "entries_key_key" ON "entries" USING btree ("key");--> statement-breakpoint
CREATE INDEX "entries_type_idx" ON "entries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "entries_parent_idx" ON "entries" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "revisions_translation_idx" ON "entry_revisions" USING btree ("translation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_translation_locale_key" ON "entry_translations" USING btree ("entry_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "entry_path_locale_key" ON "entry_translations" USING btree ("locale","path");--> statement-breakpoint
CREATE INDEX "entry_status_idx" ON "entry_translations" USING btree ("status","locale");--> statement-breakpoint
CREATE INDEX "entry_published_idx" ON "entry_translations" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "entry_scheduled_idx" ON "entry_translations" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "events_starts_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "media_created_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feedback_path_idx" ON "page_feedback" USING btree ("path","created_at");--> statement-breakpoint
CREATE INDEX "places_geo_idx" ON "places" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE UNIQUE INDEX "redirects_from_key" ON "redirects" USING btree ("from_path");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sources_name_idx" ON "sources" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_slug_locale_key" ON "tag_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_key_key" ON "tags" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree (lower("email"));