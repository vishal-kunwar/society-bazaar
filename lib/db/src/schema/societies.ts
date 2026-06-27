import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const societiesTable = pgTable("societies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull().default(""),
  locality: text("locality").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.name, t.locality, t.city)
]);

export const insertSocietySchema = createInsertSchema(societiesTable).omit({ id: true, createdAt: true });
export type InsertSociety = z.infer<typeof insertSocietySchema>;
export type Society = typeof societiesTable.$inferSelect;
