import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const dailyDealsTable = pgTable("daily_deals", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DailyDeal = typeof dailyDealsTable.$inferSelect;
