CREATE TABLE "concept_mastery" (
	"id" text PRIMARY KEY NOT NULL,
	"knowledge_node_id" text,
	"mastery" real DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"last_correct_at" timestamp,
	"last_incorrect_at" timestamp,
	"next_review_at" timestamp,
	"review_interval" integer DEFAULT 1 NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"consecutive_correct" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "concept_mastery_knowledge_node_id_unique" UNIQUE("knowledge_node_id")
);
--> statement-breakpoint
CREATE TABLE "daily_activity" (
	"date" date PRIMARY KEY NOT NULL,
	"lessons_completed" integer DEFAULT 0 NOT NULL,
	"reviews_completed" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extracted_media" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text,
	"type" text,
	"storage_path" text NOT NULL,
	"description" text,
	"labels" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_edge" (
	"id" text PRIMARY KEY NOT NULL,
	"from_node_id" text,
	"to_node_id" text,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_node" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"detail" text,
	"importance" integer NOT NULL,
	"category" text NOT NULL,
	"source_chunks" jsonb NOT NULL,
	"source_pages" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text,
	"title" text NOT NULL,
	"sort_order" integer,
	"status" text DEFAULT 'locked' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"score" integer,
	"passed" boolean,
	"is_diagnostic" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_node" (
	"lesson_id" text,
	"knowledge_node_id" text,
	CONSTRAINT "lesson_node_lesson_id_knowledge_node_id_pk" PRIMARY KEY("lesson_id","knowledge_node_id")
);
--> statement-breakpoint
CREATE TABLE "node_media" (
	"knowledge_node_id" text,
	"media_id" text,
	CONSTRAINT "node_media_knowledge_node_id_media_id_pk" PRIMARY KEY("knowledge_node_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text,
	"knowledge_node_id" text,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"expected_answer" text NOT NULL,
	"acceptable_variants" jsonb,
	"distractors" jsonb,
	"options" jsonb,
	"media_id" text,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"grounding_chunk" text NOT NULL,
	"times_asked" integer DEFAULT 0 NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_result" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text,
	"question_id" text,
	"user_answer" text,
	"correct" boolean NOT NULL,
	"error_type" text,
	"feedback" text,
	"response_ms" integer,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"raw_content" text,
	"normalized" text,
	"status" text DEFAULT 'processing' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"last_session_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "concept_mastery" ADD CONSTRAINT "concept_mastery_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extracted_media" ADD CONSTRAINT "extracted_media_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edge" ADD CONSTRAINT "knowledge_edge_from_node_id_knowledge_node_id_fk" FOREIGN KEY ("from_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_edge" ADD CONSTRAINT "knowledge_edge_to_node_id_knowledge_node_id_fk" FOREIGN KEY ("to_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node" ADD CONSTRAINT "knowledge_node_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_source_id_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_attempt" ADD CONSTRAINT "lesson_attempt_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_node" ADD CONSTRAINT "lesson_node_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_node" ADD CONSTRAINT "lesson_node_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_media" ADD CONSTRAINT "node_media_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_media" ADD CONSTRAINT "node_media_media_id_extracted_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."extracted_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_media_id_extracted_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."extracted_media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_result" ADD CONSTRAINT "question_result_attempt_id_lesson_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."lesson_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_result" ADD CONSTRAINT "question_result_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;