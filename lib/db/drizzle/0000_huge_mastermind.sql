CREATE TYPE "public"."business_category" AS ENUM('Food & Tiffin', 'Bakery & Sweets', 'Retail & Daily Needs', 'Clothing & Fashion', 'Beauty & Wellness', 'Salon at Home', 'Fitness, Yoga & Zumba', 'Tuition & Classes', 'Arts, Music & Hobby Classes', 'Tailoring & Boutique', 'Home Services', 'Repairs & Maintenance', 'Pet Care', 'Photography & Events', 'Gifts & Handmade', 'Tech & Digital Services', 'Travel & Transport', 'Others');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('pending', 'approved', 'rejected', 'paused');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free_trial', 'pro');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "societies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"city" varchar(100) DEFAULT '' NOT NULL,
	"locality" varchar(100) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "societies_name_locality_city_unique" UNIQUE("name","locality","city")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"owner_name" text NOT NULL,
	"business_name" text NOT NULL,
	"society_id" integer NOT NULL,
	"category" "business_category" NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" text NOT NULL,
	"description" varchar(1000) NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"status" "business_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"subscription_plan" "subscription_plan" DEFAULT 'free_trial' NOT NULL,
	"pro_valid_until" timestamp with time zone,
	"email" text,
	"years_in_business" integer,
	"tower" text,
	"flat_number" text,
	"city" text,
	"alternate_phone" text,
	"instagram" text,
	"website" text,
	"price_range" text,
	"services_offered" varchar(500),
	"cover_image_url" text
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"clerk_user_id" text NOT NULL,
	"reviewer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"clerk_user_id" text,
	"ip_address" varchar(45),
	"source" varchar(50) DEFAULT 'whatsapp' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"clerk_user_id" text NOT NULL,
	"title" varchar(150) NOT NULL,
	"body" varchar(2000) NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"clerk_user_id" text NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" varchar(1000) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favourites" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"business_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fav_unique" UNIQUE("clerk_user_id","business_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1000) DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"price" varchar(50) DEFAULT '' NOT NULL,
	"category" varchar(50) DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"utr_number" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_utr_number_unique" UNIQUE("utr_number")
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_deals" ADD CONSTRAINT "daily_deals_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;