import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const societiesTable = pgTable("societies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  city: text("city").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSocietySchema = createInsertSchema(societiesTable).omit({ id: true, createdAt: true });
export type InsertSociety = z.infer<typeof insertSocietySchema>;
export type Society = typeof societiesTable.$inferSelect;
