import { pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const dailyDealsTable = pgTable("daily_deals", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  offerPrice: text("offer_price"),
  views: integer("views").default(0).notNull(),
  whatsappClicks: integer("whatsapp_clicks").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DailyDeal = typeof dailyDealsTable.$inferSelect;
