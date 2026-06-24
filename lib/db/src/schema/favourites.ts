import { pgTable, serial, text, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { businessesTable } from "./businesses";

export const favouritesTable = pgTable("favourites", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("fav_unique").on(t.clerkUserId, t.businessId),
]);

export type Favourite = typeof favouritesTable.$inferSelect;
