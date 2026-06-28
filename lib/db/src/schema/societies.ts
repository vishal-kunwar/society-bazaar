import { pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const societiesTable = pgTable("societies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull().default(""),
  locality: varchar("locality", { length: 100 }).notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique().on(t.name, t.locality, t.city)
]);

export const insertSocietySchema = createInsertSchema(societiesTable).omit({ id: true, createdAt: true }) as unknown as z.ZodObject<any, any, any>;
export type InsertSociety = z.infer<typeof insertSocietySchema>;
export type Society = typeof societiesTable.$inferSelect;
