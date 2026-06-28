-- Safe migration: add starts_at column, backfill existing rows from created_at, then enforce NOT NULL
ALTER TABLE "daily_deals" ADD COLUMN "starts_at" timestamp with time zone;
UPDATE "daily_deals" SET "starts_at" = "created_at" WHERE "starts_at" IS NULL;
ALTER TABLE "daily_deals" ALTER COLUMN "starts_at" SET NOT NULL;