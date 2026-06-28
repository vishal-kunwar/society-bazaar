import { pgTable, serial, text, timestamp, integer, pgEnum, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { businessesTable } from "./businesses";

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businessesTable.id, { onDelete: "cascade" }),
  utrNumber: varchar("utr_number", { length: 255 }).notNull().unique(),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true, createdAt: true, updatedAt: true,
}) as unknown as z.ZodObject<any, any, any>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
