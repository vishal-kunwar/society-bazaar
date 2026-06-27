import { pgTable, serial, text, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const feedPostsTable = pgTable("feed_posts", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id").notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  body: varchar("body", { length: 2000 }).notNull(),
  imageUrl: text("image_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FeedPost = typeof feedPostsTable.$inferSelect;
