ALTER TABLE "businesses" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "daily_deals" ADD COLUMN "offer_price" text;--> statement-breakpoint
ALTER TABLE "daily_deals" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_deals" ADD COLUMN "whatsapp_clicks" integer DEFAULT 0 NOT NULL;